"""
Pydantic schemas for the Message resource.

`SourceCitation` is the shape of each entry in a message's `sources` JSON
column — one per retrieved chunk that contributed to the answer, carrying
enough info for the frontend to render "📄 filename.pdf — Page 4" plus a
short preview snippet.
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class SourceCitation(BaseModel):
    document_id: uuid.UUID
    document_name: str
    page_number: Optional[int] = None  # 1-indexed for display
    snippet: str


class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    sources: Optional[list[SourceCitation]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatHistoryResponse(BaseModel):
    chat_id: uuid.UUID
    title: str
    messages: list[MessageResponse]
