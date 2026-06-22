"""
Document business logic.

Handles saving uploaded PDFs to disk, creating/reading/deleting their
database records, and enforcing that users can only ever touch their own
documents (every query filters by user_id).
"""

import uuid

from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.user import User
from app.utils.file_utils import (
    validate_pdf,
    validate_file_size,
    build_document_file_path,
    save_uploaded_file,
    delete_file_if_exists,
)
from app.utils.logger import logger


def upload_document(db: Session, current_user: User, file: UploadFile) -> Document:
    """
    Validates and saves an uploaded PDF, then creates its database record
    with status="processing". The actual text extraction / embedding /
    FAISS indexing happens in Phase 4 — this function only handles the
    upload + bookkeeping half of the flow.
    """
    validate_pdf(file)

    file_bytes = file.file.read()
    validate_file_size(file_bytes)

    document_id = uuid.uuid4()
    destination_path = build_document_file_path(str(current_user.id), document_id)
    save_uploaded_file(file_bytes, destination_path)

    new_document = Document(
        id=document_id,
        user_id=current_user.id,
        filename=file.filename,
        file_path=str(destination_path),
        file_size_bytes=len(file_bytes),
        status="processing",
    )
    db.add(new_document)
    db.commit()
    db.refresh(new_document)

    logger.info("Document uploaded: %s (user=%s)", new_document.filename, current_user.id)
    return new_document


def list_documents(db: Session, current_user: User) -> list[Document]:
    return (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .all()
    )


def get_document(db: Session, current_user: User, document_id: uuid.UUID) -> Document:
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )
    return document


def delete_document(db: Session, current_user: User, document_id: uuid.UUID) -> None:
    document = get_document(db, current_user, document_id)

    # Remove the raw PDF and its FAISS index (if it was built) from disk.
    delete_file_if_exists(document.file_path)
    if document.vector_store_path:
        import shutil

        shutil.rmtree(document.vector_store_path, ignore_errors=True)

    db.delete(document)
    db.commit()
    logger.info("Document deleted: %s (user=%s)", document.filename, current_user.id)
