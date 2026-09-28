import asyncio
from datetime import datetime, timedelta, timezone
import re
from typing import Any, Dict, List, Optional
import uuid

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from fastapi import HTTPException, status

from app.core.security import get_valid_credentials
from app.models.meeting import Meeting, MeetingStatus
from app.models.user import User


class CalendarService:
    """Service to interact with Google Calendar API and sync Google Meet events."""

    @staticmethod
    def _extract_meet_link(event: Dict[str, Any]) -> Optional[str]:
        """Extract Google Meet link from conferenceData, hangoutLink, location, or description."""
        # 1. Direct hangoutLink
        if event.get("hangoutLink"):
            return event["hangoutLink"]

        # 2. Check conferenceData entryPoints
        conference_data = event.get("conferenceData", {})
        for entry in conference_data.get("entryPoints", []):
            if entry.get("entryPointType") == "video" and entry.get("uri"):
                return entry["uri"]

        # 3. Regex search in description and location
        pattern = r"https?://meet\.google\.com/[a-z]{3}-[a-z]{4}-[a-z]{3}"
        for field in ("location", "description"):
            text = event.get(field) or ""
            match = re.search(pattern, text)
            if match:
                return match.group(0)

        return None

    @staticmethod
    def _parse_event_datetime(dt_dict: Dict[str, Any]) -> datetime:
        """Parse start or end datetime from Google Calendar event dictionary."""
        dt_str = dt_dict.get("dateTime") or dt_dict.get("date")
        if not dt_str:
            return datetime.utcnow()

        # Handle 'Z' or offset
        if dt_str.endswith("Z"):
            dt_str = dt_str[:-1] + "+00:00"

        try:
            parsed = datetime.fromisoformat(dt_str)
            # Normalize to UTC naive for Beanie/MongoDB indexing
            if parsed.tzinfo is not None:
                parsed = parsed.astimezone(timezone.utc).replace(tzinfo=None)
            return parsed
        except Exception:
            return datetime.utcnow()

    @classmethod
    async def fetch_and_sync_meetings(
        cls,
        user: User,
        days_back: int = 7,
        days_forward: int = 30,
        max_pages: int = 5,
    ) -> Dict[str, Any]:
        """
        Fetches calendar events from Google Calendar API, filters for Google Meet calls,
        and synchronizes them into the Meeting collection.
        """
        creds = await get_valid_credentials(user)

        time_min = (datetime.utcnow() - timedelta(days=days_back)).isoformat() + "Z"
        time_max = (datetime.utcnow() + timedelta(days=days_forward)).isoformat() + "Z"

        def _fetch_all_events() -> List[Dict[str, Any]]:
            service = build("calendar", "v3", credentials=creds, cache_discovery=False)
            events: List[Dict[str, Any]] = []
            page_token = None
            page_count = 0

            while page_count < max_pages:
                req = service.events().list(
                    calendarId="primary",
                    timeMin=time_min,
                    timeMax=time_max,
                    singleEvents=True,
                    orderBy="startTime",
                    maxResults=100,
                    pageToken=page_token,
                )
                res = req.execute()
                items = res.get("items", [])
                events.extend(items)

                page_token = res.get("nextPageToken")
                page_count += 1
                if not page_token:
                    break

            return events

        # Run synchronous Google API calls in thread pool to avoid blocking async loop
        try:
            raw_events = await asyncio.to_thread(_fetch_all_events)
        except HttpError as e:
            error_details = str(e)
            if e.resp.status in (401, 403):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Google Calendar access denied. Please verify Calendar API is enabled: {error_details}",
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Google Calendar API error: {error_details}",
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch calendar events: {str(e)}",
            )

        now = datetime.utcnow()
        created_count = 0
        updated_count = 0
        synced_meetings: List[Meeting] = []

        for item in raw_events:
            # Day 4: Filter events to extract only Google Meet meetings
            meet_link = cls._extract_meet_link(item)
            if not meet_link:
                continue

            event_id = item.get("id")
            title = item.get("summary") or "Untitled Meeting"
            start_dt = cls._parse_event_datetime(item.get("start", {}))
            end_dt = cls._parse_event_datetime(item.get("end", {}))

            duration_minutes = int((end_dt - start_dt).total_seconds() / 60)
            if duration_minutes <= 0:
                duration_minutes = 30

            participants = [
                attendee.get("email")
                for attendee in item.get("attendees", [])
                if attendee.get("email")
            ]

            # Calculate status
            meeting_status = (
                MeetingStatus.COMPLETED if end_dt < now else MeetingStatus.UPCOMING
            )

            # Upsert into MongoDB
            existing_meeting = await Meeting.find_one(
                Meeting.userId == user.userId,
                Meeting.calendarEventId == event_id,
            )

            if existing_meeting:
                existing_meeting.title = title
                existing_meeting.scheduledAt = start_dt
                existing_meeting.duration = duration_minutes
                existing_meeting.participants = participants
                existing_meeting.meetLink = meet_link
                # Only update status if currently UPCOMING and now completed
                if (
                    existing_meeting.status == MeetingStatus.UPCOMING
                    and end_dt < now
                ):
                    existing_meeting.status = MeetingStatus.COMPLETED
                existing_meeting.updatedAt = datetime.utcnow()
                await existing_meeting.save()
                updated_count += 1
                synced_meetings.append(existing_meeting)
            else:
                new_meeting = Meeting(
                    meetingId=f"meet_{uuid.uuid4().hex[:12]}",
                    userId=user.userId,
                    title=title,
                    scheduledAt=start_dt,
                    duration=duration_minutes,
                    participants=participants,
                    meetLink=meet_link,
                    calendarEventId=event_id,
                    status=meeting_status,
                    createdAt=datetime.utcnow(),
                    updatedAt=datetime.utcnow(),
                )
                await new_meeting.insert()
                created_count += 1
                synced_meetings.append(new_meeting)

        return {
            "status": "success",
            "message": f"Calendar sync complete. {created_count} added, {updated_count} updated.",
            "totalProcessed": len(raw_events),
            "syncedCount": len(synced_meetings),
            "createdCount": created_count,
            "updatedCount": updated_count,
            "meetings": [
                {
                    "meetingId": m.meetingId,
                    "title": m.title,
                    "scheduledAt": m.scheduledAt.isoformat() + "Z",
                    "duration": m.duration,
                    "meetLink": m.meetLink,
                    "status": m.status,
                    "participants": m.participants,
                }
                for m in synced_meetings
            ],
        }
