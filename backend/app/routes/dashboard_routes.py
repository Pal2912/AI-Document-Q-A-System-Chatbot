"""
Dashboard route — a single endpoint the frontend dashboard page calls once
to get everything it needs to render (Phase 8 uses this directly).
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.dashboard_schema import DashboardResponse
from app.services.dashboard_service import get_dashboard_data

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_dashboard_data(db, current_user)
