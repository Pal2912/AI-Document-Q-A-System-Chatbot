"""
RAG processing pipeline orchestrator.

This is the function that runs (as a FastAPI BackgroundTask, see
document_service.py) right after a PDF is uploaded. It owns the full
journey from "raw PDF on disk" to "queryable FAISS index", and is
responsible for updating the document's `status` in PostgreSQL so the
frontend can show "Processing..." -> "Ready" -> or "Failed" with a reason.

Why a BackgroundTask instead of a separate task queue (Celery/Redis)?
  For this project's scale (single-server deployment, modest document
  volume), a BackgroundTask is simpler to run and deploy — no extra moving
  parts (no Redis, no worker process to keep alive on Render). The trade-off
  is that processing competes for the same process's CPU/memory as serving
  HTTP requests; if this app needed to scale to heavy concurrent uploads,
  migrating this function's body into a Celery task would be the next step,
  and the function signature here wouldn't need to change at all.
"""

from sqlalchemy.orm import Session

from app.models.document import Document
from app.rag.pdf_loader import load_pdf_pages
from app.rag.chunker import split_into_chunks
from app.rag.vector_store import build_and_save_index
from app.utils.logger import logger


def process_document(db: Session, document_id: str) -> None:
    """
    Runs the full pipeline for one document and updates its status.
    Any exception is caught so a failure marks the document "failed" with
    a reason, rather than crashing the background task silently.
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        logger.error("process_document: document %s not found", document_id)
        return

    try:
        logger.info("Processing document %s (%s)...", document.id, document.filename)

        pages = load_pdf_pages(document.file_path)
        chunks = split_into_chunks(pages)

        if not chunks:
            raise ValueError("Document produced no text chunks after splitting.")

        vector_store_path = build_and_save_index(
            user_id=str(document.user_id),
            document_id=str(document.id),
            chunks=chunks,
        )

        document.page_count = len(pages)
        document.vector_store_path = vector_store_path
        document.status = "ready"
        db.commit()

        logger.info("Document %s is ready (%d pages, %d chunks).", document.id, len(pages), len(chunks))

    except Exception as e:
        logger.error("Document %s processing failed: %s", document.id, str(e))
        document.status = "failed"
        db.commit()
