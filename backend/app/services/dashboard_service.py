"""
Dashboard business logic — aggregates a user's stats for the dashboard page:
total documents, total chats, and the most recent few of each.
"""

from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.chat import Chat
from app.models.user import User
from app.schemas.dashboard_schema import DashboardResponse, RecentDocumentItem, RecentChatItem

RECENT_LIMIT = 5


def get_dashboard_data(db: Session, current_user: User) -> DashboardResponse:
    total_documents = db.query(Document).filter(Document.user_id == current_user.id).count()
    total_chats = db.query(Chat).filter(Chat.user_id == current_user.id).count()

    recent_documents = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .limit(RECENT_LIMIT)
        .all()
    )
    recent_chats = (
        db.query(Chat)
        .filter(Chat.user_id == current_user.id)
        .order_by(Chat.created_at.desc())
        .limit(RECENT_LIMIT)
        .all()
    )

    return DashboardResponse(
        total_documents=total_documents,
        total_chats=total_chats,
        recent_documents=[RecentDocumentItem.model_validate(d) for d in recent_documents],
        recent_chats=[RecentChatItem.model_validate(c) for c in recent_chats],
    )
