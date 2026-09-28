from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class UserBase(BaseModel):
    email: EmailStr
    name: str
    avatarUrl: Optional[str] = None


class UserCreate(UserBase):
    userId: str
    googleId: Optional[str] = None


class UserResponse(UserBase):
    userId: str
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)
