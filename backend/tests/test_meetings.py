from datetime import datetime, timedelta
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.core.security import create_access_token
from app.database import close_db, init_db
from app.main import app
from app.models.meeting import Meeting, MeetingStatus
from app.models.user import User


@pytest_asyncio.fixture(autouse=True)
async def db_setup():
    """Ensure MongoDB connection is active for tests."""
    await init_db()
    yield
    await close_db()


@pytest_asyncio.fixture
async def auth_context():
    """Provide a test user and their JWT auth headers."""
    user = await User.find_one(User.email == "jayrajsinhbhatti9687@gmail.com")
    if not user:
        user = await User.find_first()

    token = create_access_token(subject=user.userId)
    headers = {"Authorization": f"Bearer {token}"}
    return {"user": user, "headers": headers}


@pytest.mark.asyncio
async def test_unauthorized_access():
    """Requests without a token should return 401."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/v1/meetings/")
    assert resp.status_code == 401
    assert resp.json()["status"] == "error"


@pytest.mark.asyncio
async def test_meeting_crud_flow(auth_context):
    """Full CRUD lifecycle test for meetings: Create, List, Filter, Update, Delete."""
    headers = auth_context["headers"]
    user = auth_context["user"]

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. CREATE MEETING
        new_meeting_payload = {
            "title": "Automated Unit Test Sync",
            "scheduledAt": (datetime.utcnow() + timedelta(days=2)).isoformat() + "Z",
            "duration": 45,
            "participants": ["colleague@example.com"],
            "meetLink": "https://meet.google.com/abc-defg-hij",
            "status": "upcoming",
        }
        create_resp = await ac.post("/api/v1/meetings/", json=new_meeting_payload, headers=headers)
        assert create_resp.status_code == 201
        created = create_resp.json()
        assert created["title"] == "Automated Unit Test Sync"
        assert created["duration"] == 45
        assert created["userId"] == user.userId
        meeting_id = created["meetingId"]

        # 2. GET SINGLE MEETING
        get_resp = await ac.get(f"/api/v1/meetings/{meeting_id}", headers=headers)
        assert get_resp.status_code == 200
        assert get_resp.json()["meetingId"] == meeting_id

        # 3. LIST & SEARCH MEETINGS
        list_resp = await ac.get(
            f"/api/v1/meetings/?search=Automated&status=upcoming&skip=0&limit=10",
            headers=headers,
        )
        assert list_resp.status_code == 200
        list_data = list_resp.json()
        assert list_data["total"] >= 1
        assert any(item["meetingId"] == meeting_id for item in list_data["items"])

        # 4. UPDATE MEETING
        update_payload = {
            "title": "Updated Automated Meeting Title",
            "duration": 60,
        }
        patch_resp = await ac.patch(
            f"/api/v1/meetings/{meeting_id}",
            json=update_payload,
            headers=headers,
        )
        assert patch_resp.status_code == 200
        assert patch_resp.json()["title"] == "Updated Automated Meeting Title"
        assert patch_resp.json()["duration"] == 60

        # 5. DELETE MEETING
        del_resp = await ac.delete(f"/api/v1/meetings/{meeting_id}", headers=headers)
        assert del_resp.status_code == 200
        assert del_resp.json()["status"] == "success"

        # 6. CONFIRM 404 AFTER DELETION
        get_after_del = await ac.get(f"/api/v1/meetings/{meeting_id}", headers=headers)
        assert get_after_del.status_code == 404
        assert get_after_del.json()["status"] == "error"
