"""
File handling utilities for document uploads.

Storage convention:
  Raw PDFs are saved to: storage/uploaded_pdfs/{user_id}/{document_id}.pdf
  Each user gets their own subfolder so files never collide and deleting a
  user's folder is a clean way to remove all their data if needed.
"""

import os
import uuid
from pathlib import Path

from fastapi import UploadFile, HTTPException, status

from app.config import settings

ALLOWED_EXTENSION = ".pdf"
ALLOWED_CONTENT_TYPE = "application/pdf"


def validate_pdf(file: UploadFile) -> None:
    """Raises 400 if the uploaded file isn't a PDF."""
    if not file.filename.lower().endswith(ALLOWED_EXTENSION):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported.",
        )
    if file.content_type != ALLOWED_CONTENT_TYPE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Please upload a valid PDF.",
        )


def validate_file_size(file_bytes: bytes) -> None:
    """Raises 400 if the file exceeds MAX_UPLOAD_SIZE_MB."""
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds the maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB.",
        )


def get_user_upload_dir(user_id: str) -> Path:
    """Returns (and creates if missing) the upload directory for a specific user."""
    user_dir = Path(settings.UPLOAD_DIR) / str(user_id)
    user_dir.mkdir(parents=True, exist_ok=True)
    return user_dir


def build_document_file_path(user_id: str, document_id: uuid.UUID) -> Path:
    """Builds the on-disk path where a document's PDF will be saved."""
    user_dir = get_user_upload_dir(user_id)
    return user_dir / f"{document_id}.pdf"


def save_uploaded_file(file_bytes: bytes, destination_path: Path) -> None:
    with open(destination_path, "wb") as f:
        f.write(file_bytes)


def delete_file_if_exists(file_path: str) -> None:
    """Deletes a file from disk if it exists. Used when removing a document."""
    if file_path and os.path.exists(file_path):
        os.remove(file_path)
