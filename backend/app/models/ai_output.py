from datetime import datetime
from enum import Enum
from typing import List
from beanie import Document, Indexed
from pydantic import BaseModel, Field


class ActionItemStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"


class ActionItem(BaseModel):
    assignee: str
    task: str
    status: ActionItemStatus = ActionItemStatus.PENDING


class Flashcard(BaseModel):
    question: str
    answer: str


class AIOutput(Document):
    outputId: Indexed(str, unique=True)
    meetingId: Indexed(str, unique=True)
    summary: str
    actionItems: List[ActionItem] = Field(default_factory=list)
    keyDecisions: List[str] = Field(default_factory=list)
    importantPoints: List[str] = Field(default_factory=list)
    flashcards: List[Flashcard] = Field(default_factory=list)
    meetingDocument: str
    generatedAt: datetime = Field(default_factory=datetime.utcnow)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "aioutputs"
