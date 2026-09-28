from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.models.transcript import TranscriptSegment


class TranscriptCreate(BaseModel):
    meetingId: str
    segments: List[TranscriptSegment] = []
    fullText: str
    audioFileUrl: Optional[str] = None


class TranscriptResponse(BaseModel):
    transcriptId: str
    meetingId: str
    segments: List[TranscriptSegment]
    fullText: str
    audioFileUrl: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)
