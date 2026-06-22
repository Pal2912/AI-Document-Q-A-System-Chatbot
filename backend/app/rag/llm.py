"""
Gemini chat model — loaded once, reused everywhere.

Like embeddings.py, this avoids reconstructing the LLM client on every
request. `ChatGoogleGenerativeAI` is LangChain's wrapper around Gemini's
API, giving us a consistent `.invoke()` / `.stream()` interface regardless
of which underlying model provider we use — if this project ever needed to
swap Gemini for another model, only this file would change.
"""

from langchain_google_genai import ChatGoogleGenerativeAI

from app.config import settings
from app.utils.logger import logger

_llm: ChatGoogleGenerativeAI | None = None


def get_llm() -> ChatGoogleGenerativeAI:
    global _llm
    if _llm is None:
        logger.info("Initializing Gemini model: %s", settings.GEMINI_MODEL)
        _llm = ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.3,  # low temperature: favors grounded, factual answers over creativity
            streaming=True,
        )
    return _llm
