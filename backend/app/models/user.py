from datetime import datetime
from typing import Optional
from beanie import Document, Indexed
from pydantic import BaseModel, Field


class GoogleTokens(BaseModel):
    accessToken: Optional[str] = None
    refreshToken: Optional[str] = None
    expiryDate: Optional[datetime] = None


class User(Document):
    userId: Indexed(str, unique=True)
    googleId: Optional[Indexed(str, unique=True)] = None
    email: Indexed(str, unique=True)
    name: str
    avatarUrl: Optional[str] = None
    googleTokens: Optional[GoogleTokens] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
