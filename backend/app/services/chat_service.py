"""
Chat business logic.

Owns: creating chats, fetching chat history, listing a user's chats,
deleting chats, and orchestrating the send-message-and-stream-response flow.
"""

import uuid
from typing import Iterator

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.chat import Chat
from app.models.document import Document
from app.models.message import Message
from app.models.user import User
from app.schemas.chat_schema import ChatCreate
from app.rag.qa_chain import stream_answer, RetrievedChunk
from app.utils.logger import logger

TITLE_MAX_LENGTH = 60


def create_chat(db: Session, current_user: User, payload: ChatCreate) -> Chat:
    documents = (
        db.query(Document)
        .filter(Document.id.in_(payload.document_ids), Document.user_id == current_user.id)
        .all()
    )
    if len(documents) != len(payload.document_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more selected documents were not found.",
        )

    not_ready = [d.filename for d in documents if d.status != "ready"]
    if not_ready:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"These documents are still processing or failed: {', '.join(not_ready)}",
        )

    chat = Chat(
        user_id=current_user.id,
        title=payload.title or "New Chat",
        documents=documents,
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat


def list_chats(db: Session, current_user: User) -> list[Chat]:
    return (
        db.query(Chat)
        .filter(Chat.user_id == current_user.id)
        .order_by(Chat.created_at.desc())
        .all()
    )


def get_chat(db: Session, current_user: User, chat_id: uuid.UUID) -> Chat:
    chat = (
        db.query(Chat)
        .filter(Chat.id == chat_id, Chat.user_id == current_user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found.")
    return chat


def delete_chat(db: Session, current_user: User, chat_id: uuid.UUID) -> None:
    chat = get_chat(db, current_user, chat_id)
    db.delete(chat)
    db.commit()


def _build_history_dicts(chat: Chat) -> list[dict]:
    return [{"role": m.role, "content": m.content} for m in chat.messages]


def _maybe_set_title_from_first_message(chat: Chat, question: str) -> None:
    if chat.title == "New Chat":
        chat.title = question[:TITLE_MAX_LENGTH] + ("..." if len(question) > TITLE_MAX_LENGTH else "")


def send_message_and_stream(
    db: Session, current_user: User, chat_id: uuid.UUID, question: str
) -> Iterator[str]:
    """
    Generator used by the streaming route. Yields response text chunks as
    they arrive from Gemini. After the stream is fully consumed, saves both
    the user's question and the assistant's full answer (with sources) to
    the database — this happens at generator exhaustion, which FastAPI's
    StreamingResponse triggers naturally once it's done sending bytes.
    """
    chat = get_chat(db, current_user, chat_id)
    history = _build_history_dicts(chat)

    # Save the user's message immediately so it's persisted even if the
    # client disconnects mid-stream.
    user_message = Message(chat_id=chat.id, role="user", content=question)
    db.add(user_message)
    _maybe_set_title_from_first_message(chat, question)
    db.commit()

    token_stream, chunks = stream_answer(chat.documents, question, history)

    full_answer_parts: list[str] = []
    try:
        for token in token_stream:
            full_answer_parts.append(token)
            yield token
    finally:
        # Runs even if the client disconnects early — we still save whatever
        # was generated so far, rather than losing the assistant's message.
        full_answer = "".join(full_answer_parts).strip()
        if full_answer:
            sources = _chunks_to_source_dicts(chunks)
            assistant_message = Message(
                chat_id=chat.id,
                role="assistant",
                content=full_answer,
                sources=sources,
            )
            db.add(assistant_message)
            db.commit()
            logger.info("Saved assistant message for chat %s (%d chars)", chat.id, len(full_answer))


def _chunks_to_source_dicts(chunks: list[RetrievedChunk]) -> list[dict]:
    seen = set()
    sources = []
    for c in chunks:
        key = (c.document_id, c.page_number)
        if key in seen:
            continue
        seen.add(key)
        sources.append(
            {
                "document_id": c.document_id,
                "document_name": c.document_name,
                "page_number": c.page_number,
                "snippet": c.text[:200] + ("..." if len(c.text) > 200 else ""),
            }
        )
    return sources
