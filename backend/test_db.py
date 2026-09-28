import asyncio
from app.config import settings
from app.database import init_db, close_db
from app.models import User, Meeting, Transcript, AIOutput


async def run_db_check():
    print(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
    await init_db()

    print("\n--- 1. Testing Users ---")
    users = await User.find_all().to_list()
    print(f"Found {len(users)} user(s):", [{"id": u.userId, "email": u.email, "name": u.name} for u in users])

    print("\n--- 2. Testing Meetings ---")
    meetings = await Meeting.find_all().to_list()
    print(f"Found {len(meetings)} meeting(s):", [{"id": m.meetingId, "title": m.title, "status": m.status} for m in meetings])

    print("\n--- 3. Testing Transcripts ---")
    transcripts = await Transcript.find_all().to_list()
    print(f"Found {len(transcripts)} transcript(s):", [{"id": t.transcriptId, "meetingId": t.meetingId, "segments": len(t.segments)} for t in transcripts])

    print("\n--- 4. Testing AI Outputs ---")
    ai_outputs = await AIOutput.find_all().to_list()
    print(f"Found {len(ai_outputs)} AI output(s):", [{"id": a.outputId, "meetingId": a.meetingId, "action_items": len(a.actionItems)} for a in ai_outputs])

    print("\nAll Beanie models and MongoDB collections verified successfully!")
    await close_db()


if __name__ == "__main__":
    asyncio.run(run_db_check())
