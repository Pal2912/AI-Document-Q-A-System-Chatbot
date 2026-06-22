"""
Pydantic schemas for the dashboard summary endpoint.
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class RecentDocumentItem(BaseModel):
    id: uuid.UUID
    filename: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class RecentChatItem(BaseModel):
    id: uuid.UUID
    title: str
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardResponse(BaseModel):
    total_documents: int
    total_chats: int
    recent_documents: list[RecentDocumentItem]
    recent_chats: list[RecentChatItem]
