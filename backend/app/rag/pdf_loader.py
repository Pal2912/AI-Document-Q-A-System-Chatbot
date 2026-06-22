"""
PDF text extraction.

Uses LangChain's PyPDFLoader (which wraps pypdf under the hood) because it
returns one LangChain `Document` object per PDF page, each already carrying
page-number metadata. That per-page metadata is exactly what lets us show
"Page 4" in a source citation later (Phase 5) without any extra bookkeeping —
it travels with the text all the way through chunking and into FAISS.
"""

from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document as LangchainDocument

from app.utils.logger import logger


def load_pdf_pages(file_path: str) -> list[LangchainDocument]:
    """
    Loads a PDF and returns a list of LangChain Document objects, one per page.
    Each object has:
      .page_content -> the extracted text of that page
      .metadata      -> {"source": file_path, "page": <0-indexed page number>}

    Raises ValueError if the PDF has no extractable text (e.g. a scanned
    image-only PDF with no OCR layer) so the caller can mark the document
    as "failed" with a clear reason instead of silently indexing nothing.
    """
    loader = PyPDFLoader(file_path)
    pages = loader.load()

    non_empty_pages = [p for p in pages if p.page_content.strip()]
    if not non_empty_pages:
        raise ValueError(
            "No extractable text found in this PDF. It may be a scanned "
            "image without OCR, or password-protected."
        )

    logger.info("Extracted %d pages (%d with text) from %s", len(pages), len(non_empty_pages), file_path)
    return pages
