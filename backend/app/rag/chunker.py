"""
Text chunking.

Why RecursiveCharacterTextSplitter:
  It tries to split on paragraph breaks first, then sentences, then words —
  only falling back to a hard character cut as a last resort. This keeps
  chunks semantically coherent instead of cutting mid-sentence.

Why chunk_size=1000, chunk_overlap=200:
  - 1000 chars (~150-200 words) is large enough to contain a full idea/answer
    but small enough that embedding similarity search stays precise (a 10,000
    character chunk would "blur together" many unrelated topics).
  - 200 char overlap means a sentence that gets cut at a chunk boundary still
    appears in full in the *next* chunk too, so retrieval doesn't lose it.

Page metadata (added by pdf_loader.py) is preserved through splitting, so
every chunk still knows exactly which PDF page it came from.
"""

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document as LangchainDocument

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200


def split_into_chunks(pages: list[LangchainDocument]) -> list[LangchainDocument]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_documents(pages)
    return chunks
