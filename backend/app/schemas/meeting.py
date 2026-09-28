from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.meeting import MeetingStatus


class MeetingBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Title of the meeting")
    scheduledAt: datetime = Field(..., description="Scheduled date and time of the meeting")
    duration: int = Field(default=30, ge=1, le=1440, description="Duration in minutes (1 to 1440)")
    participants: List[str] = Field(default_factory=list, description="List of participant emails")
    meetLink: str = Field(..., description="Google Meet URL")
    status: MeetingStatus = Field(default=MeetingStatus.UPCOMING, description="Meeting status")


class MeetingCreate(MeetingBase):
    calendarEventId: Optional[str] = Field(default=None, description="Google Calendar event ID")


class MeetingUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    scheduledAt: Optional[datetime] = None
    duration: Optional[int] = Field(default=None, ge=1, le=1440)
    participants: Optional[List[str]] = None
    meetLink: Optional[str] = None
    status: Optional[MeetingStatus] = None


class MeetingResponse(MeetingBase):
    meetingId: str
    userId: str
    calendarEventId: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)


class MeetingListResponse(BaseModel):
    total: int = Field(..., description="Total number of meetings matching criteria")
    skip: int = Field(..., description="Number of items skipped")
    limit: int = Field(..., description="Page size limit")
    items: List[MeetingResponse] = Field(..., description="List of meetings")
