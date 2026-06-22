"""
Pydantic schemas for the Chat resource.
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ChatCreate(BaseModel):
    document_ids: list[uuid.UUID] = Field(
        ..., min_length=1,
        description="IDs of the document(s) this chat will be scoped to.",
    )
    title: Optional[str] = None


class ChatResponse(BaseModel):
    id: uuid.UUID
    title: str
    created_at: datetime
    document_ids: list[uuid.UUID] = []

    class Config:
        from_attributes = True


class ChatListResponse(BaseModel):
    chats: list[ChatResponse]
    total: int
