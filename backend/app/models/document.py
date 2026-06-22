"""
Document ORM model — maps to the `documents` table.

Lifecycle of a document's `status` field:
  "processing" -> set when the PDF is first uploaded (Phase 3)
  "ready"      -> set once text extraction + embedding + FAISS indexing
                  succeeds (Phase 4 wires this up)
  "failed"     -> set if any step of that pipeline throws an error

`vector_store_path` stays NULL until Phase 4 builds the FAISS index for
this document and saves it to disk.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database.base import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size_bytes = Column(BigInteger, nullable=True)
    vector_store_path = Column(String, nullable=True)
    page_count = Column(Integer, nullable=True)
    status = Column(String, default="processing")  # processing | ready | failed

    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="documents")
