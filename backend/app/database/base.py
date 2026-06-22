"""
SQLAlchemy declarative base.

Every ORM model (User, Document, Chat, Message) inherits from this `Base` class.
SQLAlchemy uses it to know which Python classes map to which database tables.
"""

from sqlalchemy.orm import declarative_base

Base = declarative_base()
