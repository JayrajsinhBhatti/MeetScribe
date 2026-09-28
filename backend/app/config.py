from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "MeetScribe API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Server & Environment
    PORT: int = 5000
    NODE_ENV: str = "development"
    CLIENT_URL: str = "http://localhost:5173"
    
    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017/meetscribe"
    
    # Google OAuth 2.0
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_CALLBACK_URL: str = "http://localhost:5000/api/v1/auth/google/callback"
    
    # JWT & Session
    JWT_SECRET: str = "meetscribe-super-secret-jwt-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    COOKIE_KEY: Optional[str] = None
    
    # AI Services
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    
    # Google Cloud Services
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None
    GCS_BUCKET_NAME: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
