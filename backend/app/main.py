from contextlib import asynccontextmanager
from datetime import datetime
import logging
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware

from app.api.v1.router import api_router
from app.config import settings
from app.database import close_db, init_db

logger = logging.getLogger("meetscribe")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB via Beanie
    await init_db()
    yield
    # Shutdown: Close database connections
    await close_db()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Centralized Error Handlers (Day 5 requirement)
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Uniform response format for HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "statusCode": exc.status_code,
            "message": exc.detail,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Uniform response format for request validation errors."""
    errors = [
        {
            "field": " -> ".join(str(loc) for loc in err["loc"]),
            "message": err["msg"],
            "type": err["type"],
        }
        for err in exc.errors()
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "error",
            "statusCode": status.HTTP_422_UNPROCESSABLE_ENTITY,
            "message": "Request validation failed",
            "errors": errors,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Catch-all uniform handler for unexpected server errors."""
    logger.exception(f"Unhandled server error on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "statusCode": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "message": "An unexpected internal server error occurred.",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        },
    )


# Session middleware
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.COOKIE_KEY or settings.JWT_SECRET,
)

# CORS configuration
origins = [
    settings.CLIENT_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 API routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint matching schema."""
    return {
        "status": "ok",
        "service": "MeetScribe Backend API (FastAPI)",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/", tags=["Root"])
async def root():
    return {"message": "MeetScribe FastAPI Server is running"}
