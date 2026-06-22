"""
Document management routes.

Endpoints:
  POST   /api/documents/upload     -> upload a PDF, returns its metadata, triggers RAG processing
  GET    /api/documents            -> list current user's documents
  GET    /api/documents/{id}       -> get one document's metadata
  DELETE /api/documents/{id}       -> delete a document (file + DB row + vector index)

All routes require authentication via get_current_user, and every database
query is scoped to current_user.id so users can never access each other's
documents, even by guessing a document's UUID.

Upload flow:
  1. File is validated and saved to disk; a Document row is created with
     status="processing" — this all happens fast, so the response returns
     immediately with status="processing".
  2. A BackgroundTask is scheduled to run `process_document()` (Phase 4's
     RAG pipeline: extract text -> chunk -> embed -> build FAISS index)
     AFTER the HTTP response has been sent to the client.
  3. The frontend polls GET /api/documents (or this document's GET /{id})
     to see status flip to "ready" or "failed".
"""

import uuid

from fastapi import APIRouter, Depends, UploadFile, File, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.database.connection import get_db, SessionLocal
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.document_schema import DocumentResponse, DocumentListResponse
from app.services.document_service import (
    upload_document,
    list_documents,
    get_document,
    delete_document,
)
from app.rag.rag_pipeline import process_document
from app.utils.logger import logger

router = APIRouter(prefix="/api/documents", tags=["Documents"])


def _run_processing_with_own_session(document_id: str) -> None:
    """
    Background tasks must NOT reuse the request's `db` session — that
    session is closed by `get_db()`'s `finally` block as soon as the
    response is returned, but this function runs afterward. So we open a
    fresh, independent session here, scoped only to this background job.
    """
    db = SessionLocal()
    try:
        process_document(db, document_id)
    except Exception as e:
        logger.error("Background processing crashed for document %s: %s", document_id, str(e))
    finally:
        db.close()


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = upload_document(db, current_user, file)
    background_tasks.add_task(_run_processing_with_own_session, str(document.id))
    return document


@router.get("", response_model=DocumentListResponse)
def list_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    documents = list_documents(db, current_user)
    return DocumentListResponse(documents=documents, total=len(documents))


@router.get("/{document_id}", response_model=DocumentResponse)
def get_one(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_document(db, current_user, document_id)


@router.delete("/{document_id}", status_code=status.HTTP_200_OK)
def delete_one(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_document(db, current_user, document_id)
    return {"message": "Document deleted successfully."}
