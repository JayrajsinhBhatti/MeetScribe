from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.security import get_current_user
from app.models.user import User
from app.services.calendar_service import CalendarService

router = APIRouter(prefix="/calendar", tags=["Google Calendar"])


@router.post("/sync")
async def sync_calendar(
    days_back: int = Query(default=7, ge=0, le=90, description="Days in the past to sync"),
    days_forward: int = Query(default=30, ge=1, le=180, description="Days in the future to sync"),
    current_user: User = Depends(get_current_user),
):
    """Sync Google Meet meetings from Google Calendar for the authenticated user."""
    if not current_user.googleTokens or not current_user.googleTokens.refreshToken:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account not connected or refresh token missing. Please sign in with Google first.",
        )

    result = await CalendarService.fetch_and_sync_meetings(
        user=current_user,
        days_back=days_back,
        days_forward=days_forward,
    )
    return result
