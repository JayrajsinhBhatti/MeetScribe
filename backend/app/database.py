import logging
from pymongo import AsyncMongoClient
from beanie import init_beanie

from app.config import settings
from app.models import User, Meeting, Transcript, AIOutput

logger = logging.getLogger("uvicorn.info")


class Database:
    client: AsyncMongoClient = None


db = Database()


async def init_db() -> None:
    logger.info(f"[MongoDB] Connecting to {settings.MONGODB_URI}...")
    db.client = AsyncMongoClient(settings.MONGODB_URI)
    db_name = settings.MONGODB_URI.split("/")[-1].split("?")[0] or "meetscribe"
    
    await init_beanie(
        database=db.client[db_name],
        document_models=[
            User,
            Meeting,
            Transcript,
            AIOutput,
        ],
    )
    logger.info(f"[MongoDB] Connected to database: {db_name}")


async def close_db() -> None:
    if db.client:
        await db.client.close()
        logger.info("[MongoDB] Connection closed.")

