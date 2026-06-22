"""
Database connection setup.

- `engine`: the actual connection pool to PostgreSQL.
- `SessionLocal`: a factory that creates new database sessions.
- `get_db()`: a FastAPI dependency. FastAPI calls this for any route that
  declares `db: Session = Depends(get_db)`. It opens a session, hands it to
  the route, and guarantees it's closed afterward (even if the route raises
  an error) via the try/finally block.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # checks connection is alive before using it (avoids stale connection errors)
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
