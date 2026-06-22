"""
Pydantic schemas for the Document resource.

Upload itself doesn't need a request schema since FastAPI handles multipart
file uploads via `UploadFile` directly in the route signature (see
document_routes.py). These schemas define what we send back to the client.
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: uuid.UUID
    filename: str
    file_size_bytes: Optional[int] = None
    page_count: Optional[int] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]
    total: int
