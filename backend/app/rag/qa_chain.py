"""
Question-answering chain: retrieval + prompt construction + Gemini generation.

This is what runs every time a user sends a chat message. The flow:

  1. RETRIEVE: run a similarity search against each document's FAISS index
     scoped to this chat (a chat can span multiple documents — see the
     chat_documents association table), using the CURRENT question only
     (not the full conversation) so retrieval stays sharply focused.
  2. MERGE & RANK: since each document has its own separate FAISS index,
     we search each one and merge results by score, then keep only the
     overall top-k across all of them.
  3. BUILD PROMPT: combine retrieved chunks (the "context") with the recent
     conversation history (for follow-up question understanding) and the
     system instructions into a single prompt Gemini can answer from.
  4. GENERATE: stream Gemini's response back token-by-token.

Conversational memory design:
  We don't use LangChain's in-memory ConversationBufferMemory because it
  would be lost on server restart and wouldn't work if this app ever ran
  on multiple server instances behind a load balancer. Instead, the last
  N messages are loaded fresh from PostgreSQL on every request and folded
  into the prompt — simple, persistent, and stateless-server-friendly.
"""

from dataclasses import dataclass
from typing import Iterator

from app.models.document import Document
from app.rag.vector_store import similarity_search
from app.rag.llm import get_llm
from app.utils.logger import logger

MAX_HISTORY_MESSAGES = 6  # last 3 user/assistant turns
CHUNKS_PER_DOCUMENT = 4   # how many chunks to retrieve from EACH document
TOP_K_OVERALL = 6         # how many chunks to keep after merging across documents

SYSTEM_PROMPT = """You are a helpful assistant that answers questions strictly using the provided document excerpts below.

Rules:
- Only answer using information found in the context. If the answer isn't in the context, say you couldn't find that information in the uploaded document(s) — do not make up an answer.
- Be concise and direct.
- If the context includes multiple relevant pieces of information, synthesize them into one coherent answer.
- Do not mention "the context" or "the excerpts" explicitly in your answer; just answer naturally as if you'd read the document yourself.
"""


@dataclass
class RetrievedChunk:
    document_id: str
    document_name: str
    page_number: int | None
    text: str


def retrieve_relevant_chunks(documents: list[Document], question: str) -> list[RetrievedChunk]:
    """
    Searches each document's FAISS index for chunks relevant to `question`,
    merges results across documents, and returns the overall top-k.

    FAISS's similarity_search (via LangChain) returns results already
    ordered by relevance for a single index; since we're merging multiple
    independent indexes, we approximate a global ranking by interleaving
    results from each in order rather than re-scoring (re-scoring would
    require pulling raw distances, which adds complexity not justified for
    a project working with a handful of documents per chat).
    """
    all_chunks: list[RetrievedChunk] = []

    for doc in documents:
        if doc.status != "ready" or not doc.vector_store_path:
            logger.info("Skipping document %s in retrieval (status=%s)", doc.id, doc.status)
            continue

        results = similarity_search(doc.vector_store_path, question, k=CHUNKS_PER_DOCUMENT)
        for r in results:
            # PyPDFLoader's page metadata is 0-indexed; +1 for human-friendly display.
            page = r.metadata.get("page")
            page_number = page + 1 if isinstance(page, int) else None
            all_chunks.append(
                RetrievedChunk(
                    document_id=str(doc.id),
                    document_name=doc.filename,
                    page_number=page_number,
                    text=r.page_content,
                )
            )

    return all_chunks[:TOP_K_OVERALL]


def build_context_block(chunks: list[RetrievedChunk]) -> str:
    if not chunks:
        return "(No relevant content was found in the selected document(s).)"

    blocks = []
    for i, chunk in enumerate(chunks, start=1):
        page_info = f", page {chunk.page_number}" if chunk.page_number else ""
        blocks.append(f"[Excerpt {i} — {chunk.document_name}{page_info}]\n{chunk.text}")
    return "\n\n".join(blocks)


def build_history_block(history_messages: list[dict]) -> str:
    """
    `history_messages` is a list of {"role": "user"|"assistant", "content": str}
    dicts, already trimmed to the last MAX_HISTORY_MESSAGES by the caller.
    """
    if not history_messages:
        return ""

    lines = []
    for msg in history_messages:
        speaker = "User" if msg["role"] == "user" else "Assistant"
        lines.append(f"{speaker}: {msg['content']}")
    return "Previous conversation:\n" + "\n".join(lines) + "\n"


def stream_answer(
    documents: list[Document],
    question: str,
    history_messages: list[dict],
) -> tuple[Iterator[str], list[RetrievedChunk]]:
    """
    Returns a (token_stream, retrieved_chunks) tuple.
    The caller (chat_service.py) streams `token_stream` to the client as
    each piece arrives, and separately uses `retrieved_chunks` to build the
    source citations attached to the saved assistant message.
    """
    chunks = retrieve_relevant_chunks(documents, question)
    context_block = build_context_block(chunks)
    history_block = build_history_block(history_messages[-MAX_HISTORY_MESSAGES:])

    prompt = (
        f"{SYSTEM_PROMPT}\n\n"
        f"{history_block}\n"
        f"Document excerpts:\n{context_block}\n\n"
        f"Question: {question}\n\n"
        f"Answer:"
    )

    llm = get_llm()

    def token_generator() -> Iterator[str]:
        for chunk in llm.stream(prompt):
            if chunk.content:
                yield chunk.content

    return token_generator(), chunks
