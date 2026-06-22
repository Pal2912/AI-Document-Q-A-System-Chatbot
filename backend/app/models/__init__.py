"""
Central import point for all ORM models.

Importing them here ensures SQLAlchemy's Base.metadata is aware of every
table before Alembic generates migrations, and before the app creates
relationships between models (e.g. User.documents -> Document).

Always import models via `from app.models import User, Document, Chat, Message`
rather than importing individual files directly, to guarantee this file runs first.
"""

from app.models.user import User
from app.models.document import Document
from app.models.chat import Chat
from app.models.message import Message

__all__ = ["User", "Document", "Chat", "Message"]
