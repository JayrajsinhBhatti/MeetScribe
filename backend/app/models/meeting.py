from datetime import datetime
from enum import Enum
from typing import List, Optional
from beanie import Document, Indexed
from pydantic import Field
import pymongo


class MeetingStatus(str, Enum):
    UPCOMING = "upcoming"
    COMPLETED = "completed"
    MISSED = "missed"


class Meeting(Document):
    meetingId: Indexed(str, unique=True)
    userId: Indexed(str)
    title: str
    scheduledAt: Indexed(datetime)
    duration: int = 30
    participants: List[str] = Field(default_factory=list)
    meetLink: str
    calendarEventId: Optional[Indexed(str)] = None
    status: MeetingStatus = MeetingStatus.UPCOMING
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "meetings"
        indexes = [
            [
                ("userId", pymongo.ASCENDING),
                ("scheduledAt", pymongo.DESCENDING),
            ]
        ]
