"""
User ORM model — maps to the `users` table in PostgreSQL.

Design notes:
  - Primary key is a UUID (not auto-increment int) so user IDs are unguessable
    and never leak how many users have signed up.
  - `hashed_password` stores a bcrypt hash, never the plain password.
  - `documents`, `chats` relationships let us do `user.documents` in Python
    instead of writing manual JOIN queries everywhere.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # One user -> many documents / chats. cascade="all, delete-orphan" means
    # deleting a user also deletes their documents and chats automatically.
    documents = relationship("Document", back_populates="owner", cascade="all, delete-orphan")
    chats = relationship("Chat", back_populates="owner", cascade="all, delete-orphan")
