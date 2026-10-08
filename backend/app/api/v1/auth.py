from datetime import datetime, timezone
from typing import Optional
import uuid
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth

from app.config import settings
from app.core.security import create_access_token, get_current_user
from app.models.user import User, GoogleTokens
from app.schemas.auth import Token
from app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth = OAuth()
if settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET:
    oauth.register(
        name="google",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={
            "scope": "openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly"
        },
    )


@router.get("/google/url")
async def get_google_auth_url(origin: Optional[str] = Query(None)):
    """Returns the Google OAuth consent URL for frontend-initiated authorization."""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth Client ID is not configured.",
        )
    
    redirect_uri = settings.GOOGLE_CALLBACK_URL
    import urllib.parse
    state_param = f"&state={urllib.parse.quote(origin)}" if origin else ""
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={settings.GOOGLE_CLIENT_ID}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=code&"
        f"scope=openid%20email%20profile%20https://www.googleapis.com/auth/calendar.events%20https://www.googleapis.com/auth/calendar.readonly&"
        f"access_type=offline&"
        f"prompt=consent"
        f"{state_param}"
    )
    return {"url": google_auth_url}


@router.get("/google/callback")
async def google_callback(
    code: str = Query(...),
    state: Optional[str] = Query(None),
):
    """Handles OAuth 2.0 authorization code exchange and user persistence."""
    token_url = "https://oauth2.googleapis.com/token"
    user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"

    async with httpx.AsyncClient() as client:
        # 1. Exchange code for access & refresh tokens
        token_response = await client.post(
            token_url,
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_CALLBACK_URL,
                "grant_type": "authorization_code",
            },
        )
        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Token exchange failed: {token_response.text}",
            )
        tokens = token_response.json()
        access_token = tokens.get("access_token")
        refresh_token = tokens.get("refresh_token")
        expires_in = tokens.get("expires_in", 3600)

        # 2. Fetch Google User Profile
        profile_response = await client.get(
            user_info_url,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if profile_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch user profile from Google",
            )
        profile = profile_response.json()

    email = profile["email"]
    name = profile.get("name", email.split("@")[0])
    avatar_url = profile.get("picture")
    google_id = profile.get("sub")

    # 3. Find or Create User
    user = await User.find_one(User.email == email)
    
    if not user:
        user = User(
            userId=str(uuid.uuid4()),
            googleId=google_id,
            email=email,
            name=name,
            avatarUrl=avatar_url,
            googleTokens=GoogleTokens(
                accessToken=access_token,
                refreshToken=refresh_token,
            ),
        )
        await user.insert()
    else:
        user.name = name
        user.avatarUrl = avatar_url
        user.googleId = google_id
        if not user.googleTokens:
            user.googleTokens = GoogleTokens()
        user.googleTokens.accessToken = access_token
        if refresh_token:
            user.googleTokens.refreshToken = refresh_token
        user.updatedAt = datetime.utcnow()
        await user.save()

    # 4. Generate application JWT token
    jwt_token = create_access_token(subject=user.userId)

    # Determine target frontend client URL
    target_client = settings.CLIENT_URL
    if state and (state.startswith("http://localhost:") or state.startswith("http://127.0.0.1:")):
        target_client = state.rstrip("/")
    else:
        # Detect active Vite dev server port (5173 or 5174) with IPv4 & IPv6 support
        try:
            import socket
            def check_port(port: int) -> bool:
                for res in socket.getaddrinfo('localhost', port, socket.AF_UNSPEC, socket.SOCK_STREAM):
                    af, socktype, proto, _, sa = res
                    try:
                        with socket.socket(af, socktype, proto) as s:
                            s.settimeout(0.2)
                            if s.connect_ex(sa) == 0:
                                return True
                    except Exception:
                        pass
                return False

            if check_port(5173):
                target_client = "http://localhost:5173"
            elif check_port(5174):
                target_client = "http://localhost:5174"
        except Exception:
            pass

    # Redirect back to frontend with JWT token in query parameters
    redirect_target = f"{target_client}/auth/callback?token={jwt_token}"
    return RedirectResponse(url=redirect_target, status_code=status.HTTP_307_TEMPORARY_REDIRECT)


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Fetch profile of currently authenticated user."""
    return current_user
