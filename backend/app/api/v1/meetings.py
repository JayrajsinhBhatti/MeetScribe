from datetime import datetime, timedelta
import re
from typing import List, Optional
import uuid
from beanie.operators import And, RegEx
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.security import get_current_user
from app.models.meeting import Meeting, MeetingStatus
from app.models.transcript import Transcript
from app.models.ai_output import AIOutput
from app.models.user import User
from app.schemas.meeting import (
    MeetingCreate,
    MeetingListResponse,
    MeetingResponse,
    MeetingUpdate,
)

router = APIRouter(prefix="/meetings", tags=["Meetings"])


async def auto_update_meeting_status(meeting: Meeting) -> Meeting:
    """Auto-transition upcoming meetings whose end time has passed."""
    now = datetime.utcnow()
    meeting_end = meeting.scheduledAt + timedelta(minutes=meeting.duration)

    if meeting.status == MeetingStatus.UPCOMING and meeting_end < now:
        # Check if meeting has a transcript
        transcript = await Transcript.find_one(Transcript.meetingId == meeting.meetingId)
        if transcript:
            meeting.status = MeetingStatus.COMPLETED
        else:
            meeting.status = MeetingStatus.MISSED
        meeting.updatedAt = now
        await meeting.save()

    return meeting


@router.get("/", response_model=MeetingListResponse)
async def list_meetings(
    status_filter: Optional[MeetingStatus] = Query(None, alias="status", description="Filter by meeting status"),
    search: Optional[str] = Query(None, min_length=1, max_length=100, description="Search by title or participant email"),
    from_date: Optional[datetime] = Query(None, description="Filter meetings scheduled on or after this timestamp"),
    to_date: Optional[datetime] = Query(None, description="Filter meetings scheduled on or before this timestamp"),
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Number of items per page"),
    current_user: User = Depends(get_current_user),
):
    """Retrieve paginated and filtered list of meetings for the authenticated user."""
    # Build query criteria
    conditions = [Meeting.userId == current_user.userId]

    if status_filter:
        conditions.append(Meeting.status == status_filter)

    if from_date:
        conditions.append(Meeting.scheduledAt >= from_date)

    if to_date:
        conditions.append(Meeting.scheduledAt <= to_date)

    if search:
        # Search in title or participants using regex
        escaped_search = re.escape(search)
        search_condition = RegEx(Meeting.title, escaped_search, "i")
        conditions.append(search_condition)

    query = And(*conditions)

    # Get total count
    total = await Meeting.find(query).count()

    # Get paginated results
    meetings = (
        await Meeting.find(query)
        .sort(-Meeting.scheduledAt)
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    # Auto-update any expired upcoming meetings
    updated_meetings = [await auto_update_meeting_status(m) for m in meetings]

    return MeetingListResponse(
        total=total,
        skip=skip,
        limit=limit,
        items=updated_meetings,
    )


@router.post("/", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
async def create_meeting(
    meeting_in: MeetingCreate,
    current_user: User = Depends(get_current_user),
):
    """Create a new meeting."""
    now = datetime.utcnow()
    new_meeting = Meeting(
        meetingId=f"meet_{uuid.uuid4().hex[:12]}",
        userId=current_user.userId,
        title=meeting_in.title,
        scheduledAt=meeting_in.scheduledAt,
        duration=meeting_in.duration,
        participants=meeting_in.participants,
        meetLink=meeting_in.meetLink,
        calendarEventId=meeting_in.calendarEventId,
        status=meeting_in.status,
        createdAt=now,
        updatedAt=now,
    )
    await new_meeting.insert()
    return new_meeting


@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
):
    """Retrieve a single meeting by its meetingId."""
    meeting = await Meeting.find_one(
        Meeting.meetingId == meeting_id,
        Meeting.userId == current_user.userId,
    )
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting '{meeting_id}' not found.",
        )
    return await auto_update_meeting_status(meeting)


@router.patch("/{meeting_id}", response_model=MeetingResponse)
async def update_meeting(
    meeting_id: str,
    meeting_update: MeetingUpdate,
    current_user: User = Depends(get_current_user),
):
    """Update meeting fields."""
    meeting = await Meeting.find_one(
        Meeting.meetingId == meeting_id,
        Meeting.userId == current_user.userId,
    )
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting '{meeting_id}' not found.",
        )

    update_data = meeting_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(meeting, field, value)

    meeting.updatedAt = datetime.utcnow()
    await meeting.save()
    return meeting


@router.delete("/{meeting_id}", status_code=status.HTTP_200_OK)
async def delete_meeting(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
):
    """Delete a meeting and any associated transcripts or AI outputs."""
    meeting = await Meeting.find_one(
        Meeting.meetingId == meeting_id,
        Meeting.userId == current_user.userId,
    )
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting '{meeting_id}' not found.",
        )

    # Clean up associated transcript and AI outputs
    await Transcript.find(Transcript.meetingId == meeting_id).delete()
    await AIOutput.find(AIOutput.meetingId == meeting_id).delete()

    # Delete meeting document
    await meeting.delete()

    return {
        "status": "success",
        "message": f"Meeting '{meeting_id}' and all associated records deleted successfully.",
    }
