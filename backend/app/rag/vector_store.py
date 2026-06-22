"""
FAISS vector store management.

Storage layout on disk:
  storage/vector_store/{user_id}/{document_id}/
    ├── index.faiss   (the actual vector index, written by FAISS)
    └── index.pkl     (metadata: chunk text + page numbers, written by LangChain)

Design choice — one FAISS index PER DOCUMENT (not one big index per user):
  - Deleting a document is just deleting its folder; no reindexing needed.
  - Querying a single document loads only that small index (fast).
  - Querying multiple documents (Phase 5) loads each relevant index and
    merges/re-ranks results — still fast since each index is small, and
    avoids the complexity of filtering one huge shared index by metadata.
"""

from pathlib import Path

from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document as LangchainDocument

from app.config import settings
from app.rag.embeddings import get_embedding_model
from app.utils.logger import logger


def get_vector_store_dir(user_id: str, document_id: str) -> Path:
    return Path(settings.VECTOR_STORE_DIR) / str(user_id) / str(document_id)


def build_and_save_index(user_id: str, document_id: str, chunks: list[LangchainDocument]) -> str:
    """
    Embeds all chunks and writes a new FAISS index to disk.
    Returns the directory path where the index was saved (stored in
    Document.vector_store_path so it can be loaded again later).
    """
    embedding_model = get_embedding_model()
    vector_store = FAISS.from_documents(chunks, embedding_model)

    save_dir = get_vector_store_dir(user_id, document_id)
    save_dir.mkdir(parents=True, exist_ok=True)
    vector_store.save_local(str(save_dir))

    logger.info("FAISS index built and saved: %s (%d chunks)", save_dir, len(chunks))
    return str(save_dir)


def load_index(vector_store_path: str) -> FAISS:
    """Loads a previously saved FAISS index back into memory for searching."""
    embedding_model = get_embedding_model()
    vector_store = FAISS.load_local(
        vector_store_path,
        embedding_model,
        allow_dangerous_deserialization=True,  # safe here: we only ever load files WE wrote
    )
    return vector_store


def similarity_search(vector_store_path: str, query: str, k: int = 4) -> list[LangchainDocument]:
    """
    Returns the top-k most similar chunks to the query, each still carrying
    its page-number metadata for source citations.
    """
    vector_store = load_index(vector_store_path)
    results = vector_store.similarity_search(query, k=k)
    return results
