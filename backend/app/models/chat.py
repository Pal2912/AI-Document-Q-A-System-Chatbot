"""
Chat ORM model — maps to the `chats` table.

A Chat is a conversation thread scoped to one or more documents (many-to-many
via the chat_documents association table below), so a user can ask questions
across multiple PDFs in a single conversation if they choose to.

`title` defaults to "New Chat" and is updated to the first user message
(truncated) once the conversation starts, so chat history is browsable
(similar to ChatGPT's sidebar behavior).
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database.base import Base

# Many-to-many association: a chat can reference multiple documents, and a
# document can be referenced by multiple chats. This is a plain association
# table (no extra columns needed), so it doesn't need its own ORM class.
chat_documents = Table(
    "chat_documents",
    Base.metadata,
    Column("chat_id", UUID(as_uuid=True), ForeignKey("chats.id"), primary_key=True),
    Column("document_id", UUID(as_uuid=True), ForeignKey("documents.id"), primary_key=True),
)


class Chat(Base):
    __tablename__ = "chats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    title = Column(String, default="New Chat")
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="chats")
    messages = relationship(
        "Message", back_populates="chat", cascade="all, delete-orphan",
        order_by="Message.created_at",
    )
    documents = relationship("Document", secondary=chat_documents)
