"""
Embedding model — loaded once, reused everywhere.

We use a local HuggingFace sentence-transformer model (all-MiniLM-L6-v2)
instead of an API-based embedding model (like Gemini's or OpenAI's):
  - Free: no per-call cost, no rate limits, runs on CPU.
  - Fast enough: ~22M parameters, embeds a chunk in milliseconds on CPU.
  - Offline-capable: works even without internet once the model is cached
    locally (first run downloads ~90MB from HuggingFace Hub).

This keeps Gemini calls reserved purely for the final answer-generation
step (Phase 5), which is the one place we actually need a large LLM.

The model is loaded once as a module-level singleton (`_embedding_model`)
the first time it's needed, not on every function call — re-loading it per
request would add multi-second latency to every single upload/query.
"""

from langchain_huggingface import HuggingFaceEmbeddings

from app.config import settings
from app.utils.logger import logger

_embedding_model: HuggingFaceEmbeddings | None = None


def get_embedding_model() -> HuggingFaceEmbeddings:
    global _embedding_model
    if _embedding_model is None:
        logger.info("Loading embedding model: %s (first load may take a moment)", settings.EMBEDDING_MODEL)
        _embedding_model = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
        logger.info("Embedding model loaded.")
    return _embedding_model
