"""
Message ORM model — maps to the `messages` table.

NOTE: Introduced now (Phase 2) so Chat's relationship() reference resolves
on import. Fully used starting Phase 5 (chat system) where `sources` stores
the retrieved document citations as JSON.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.database.base import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id = Column(UUID(as_uuid=True), ForeignKey("chats.id"), nullable=False)

    role = Column(String, nullable=False)  # "user" | "assistant"
    content = Column(Text, nullable=False)
    sources = Column(JSONB, nullable=True)  # [{document_name, page_number, snippet}]

    created_at = Column(DateTime, default=datetime.utcnow)

    chat = relationship("Chat", back_populates="messages")
