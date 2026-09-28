from app.models import GoogleTokens
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

from app.config import settings
from app.models.user import User

import httpx
from google.oauth2.credentials import Credentials

security_scheme = HTTPBearer(auto_error=False)

async def get_valid_credentials(user: User) -> Credentials:
    """
    Returns valid Google OAuth2 credentials for the given user.
    Refreshes the access token using the stored refresh_token if expired.
    """

    if not user.googleTokens or not user.googleTokens.refreshToken:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account not connected or refresh token missing.",
        )

    creds = Credentials(
        token=user.googleTokens.accessToken,
        refresh_token=user.googleTokens.refreshToken,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        scopes=["https://www.googleapis.com/auth/calendar.readonly"],
    )

    try:
        async with httpx.AsyncClient() as client:
            refresh_resp = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "refresh_token": user.googleTokens.refreshToken,
                    "grant_type": "refresh_token",
                },
            )
            
            if refresh_resp.status_code == 200:
                data = refresh_resp.json()
                new_access_token = data.get("access_token")
                # Update MongoDB
                user.googleTokens.accessToken = new_access_token
                user.updatedAt = datetime.utcnow()
                await user.save()
                creds = Credentials(
                    token=new_access_token,
                    refresh_token=user.googleTokens.refreshToken,
                    token_uri="https://oauth2.googleapis.com/token",
                    client_id=settings.GOOGLE_CLIENT_ID,
                    client_secret=settings.GOOGLE_CLIENT_SECRET,
                    scopes=["https://www.googleapis.com/auth/calendar.readonly"],
                )
    except Exception as e:
        # Fall back to existing credentials or raise 401 if failed
        pass
    return creds


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user = await User.find_one(User.userId == user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user
