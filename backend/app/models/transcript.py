from datetime import datetime
from typing import List, Optional
from beanie import Document, Indexed
from pydantic import BaseModel, Field


class TranscriptSegment(BaseModel):
    speaker: str
    text: str
    timestamp: float


class Transcript(Document):
    transcriptId: Indexed(str, unique=True)
    meetingId: Indexed(str, unique=True)
    segments: List[TranscriptSegment] = Field(default_factory=list)
    fullText: str
    audioFileUrl: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "transcripts"
