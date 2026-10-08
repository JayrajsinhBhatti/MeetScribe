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
        deleted_count = 0
        synced_meetings: List[Meeting] = []
        active_google_event_ids = set()

        for item in raw_events:
            event_id = item.get("id")
            if not event_id:
                continue

            # If event was cancelled/deleted on Google Calendar
            if item.get("status") == "cancelled":
                cancelled_meeting = await Meeting.find_one(
                    Meeting.userId == user.userId,
                    Meeting.calendarEventId == event_id,
                )
                if cancelled_meeting:
                    from app.models.transcript import Transcript
                    from app.models.ai_output import AIOutput
                    await Transcript.find(Transcript.meetingId == cancelled_meeting.meetingId).delete()
                    await AIOutput.find(AIOutput.meetingId == cancelled_meeting.meetingId).delete()
                    await cancelled_meeting.delete()
                    deleted_count += 1
                continue

            # Filter events to extract only Google Meet meetings
            meet_link = cls._extract_meet_link(item)
            if not meet_link:
                continue

            active_google_event_ids.add(event_id)

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
                existing_meeting.status = meeting_status
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

        # RECONCILIATION: Check for meetings in MongoDB within the sync window that have a calendarEventId,
        # but are no longer in Google Calendar active events (e.g. user deleted them on Google Calendar)
        start_bound = datetime.utcnow() - timedelta(days=days_back)
        end_bound = datetime.utcnow() + timedelta(days=days_forward)

        stale_meetings = await Meeting.find(
            Meeting.userId == user.userId,
            Meeting.calendarEventId != None,
            Meeting.scheduledAt >= start_bound,
            Meeting.scheduledAt <= end_bound,
        ).to_list()

        for stale in stale_meetings:
            if stale.calendarEventId and stale.calendarEventId not in active_google_event_ids:
                from app.models.transcript import Transcript
                from app.models.ai_output import AIOutput
                await Transcript.find(Transcript.meetingId == stale.meetingId).delete()
                await AIOutput.find(AIOutput.meetingId == stale.meetingId).delete()
                await stale.delete()
                deleted_count += 1

        return {
            "status": "success",
            "message": f"Calendar sync complete. {created_count} added, {updated_count} updated, {deleted_count} removed.",
            "totalProcessed": len(raw_events),
            "syncedCount": len(synced_meetings),
            "createdCount": created_count,
            "updatedCount": updated_count,
            "deletedCount": deleted_count,
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

    @classmethod
    async def create_calendar_event(
        cls,
        user: User,
        title: str,
        scheduled_at: datetime,
        duration_minutes: int = 30,
        participants: Optional[List[str]] = None,
        meet_link: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Creates an event in user's primary Google Calendar with Google Meet link.
        """
        try:
            creds = await get_valid_credentials(user)
        except Exception as e:
            return {"success": False, "error": f"Credentials error: {str(e)}"}

        def _insert_event():
            service = build("calendar", "v3", credentials=creds, cache_discovery=False)
            end_dt = scheduled_at + timedelta(minutes=duration_minutes)

            start_iso = scheduled_at.strftime("%Y-%m-%dT%H:%M:%SZ")
            end_iso = end_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

            body: Dict[str, Any] = {
                "summary": title,
                "description": "Scheduled via MeetScribe",
                "start": {
                    "dateTime": start_iso,
                },
                "end": {
                    "dateTime": end_iso,
                },
                "conferenceData": {
                    "createRequest": {
                        "requestId": f"meet_{uuid.uuid4().hex[:10]}",
                        "conferenceSolutionKey": {"type": "hangoutsMeet"},
                    }
                },
            }

            if participants:
                body["attendees"] = [{"email": p} for p in participants if p and "@" in p]

            created = service.events().insert(
                calendarId="primary",
                body=body,
                conferenceDataVersion=1,
            ).execute()
            return created

        try:
            event = await asyncio.to_thread(_insert_event)
            event_id = event.get("id")
            extracted_meet_link = cls._extract_meet_link(event) or meet_link or event.get("htmlLink")
            return {
                "success": True,
                "eventId": event_id,
                "meetLink": extracted_meet_link,
            }
        except HttpError as e:
            err_str = str(e)
            return {
                "success": False,
                "error": f"Google Calendar API HttpError: {err_str}",
                "status_code": e.resp.status,
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to insert event to Google Calendar: {str(e)}",
            }

    @classmethod
    async def update_calendar_event(
        cls,
        user: User,
        event_id: str,
        title: Optional[str] = None,
        scheduled_at: Optional[datetime] = None,
        duration_minutes: Optional[int] = None,
        participants: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Updates an existing event in user's primary Google Calendar.
        """
        if not event_id:
            return {"success": False, "error": "No calendar event_id"}

        try:
            creds = await get_valid_credentials(user)
        except Exception as e:
            return {"success": False, "error": f"Credentials error: {str(e)}"}

        def _patch_event():
            service = build("calendar", "v3", credentials=creds, cache_discovery=False)
            patch_body: Dict[str, Any] = {}
            if title is not None:
                patch_body["summary"] = title

            if scheduled_at is not None:
                duration = duration_minutes or 30
                end_dt = scheduled_at + timedelta(minutes=duration)
                patch_body["start"] = {"dateTime": scheduled_at.strftime("%Y-%m-%dT%H:%M:%SZ")}
                patch_body["end"] = {"dateTime": end_dt.strftime("%Y-%m-%dT%H:%M:%SZ")}

            if participants is not None:
                patch_body["attendees"] = [{"email": p} for p in participants if p and "@" in p]

            updated = service.events().patch(
                calendarId="primary",
                eventId=event_id,
                body=patch_body,
            ).execute()
            return updated

        try:
            event = await asyncio.to_thread(_patch_event)
            extracted_meet_link = cls._extract_meet_link(event) or event.get("htmlLink")
            return {
                "success": True,
                "eventId": event.get("id"),
                "meetLink": extracted_meet_link,
            }
        except HttpError as e:
            return {
                "success": False,
                "error": f"Google Calendar API HttpError: {str(e)}",
                "status_code": e.resp.status,
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to patch event on Google Calendar: {str(e)}",
            }

    @classmethod
    async def delete_calendar_event(
        cls,
        user: User,
        event_id: str,
    ) -> Dict[str, Any]:
        """
        Deletes an event from user's primary Google Calendar.
        """
        if not event_id:
            return {"success": False, "error": "No calendar event_id"}

        try:
            creds = await get_valid_credentials(user)
        except Exception as e:
            return {"success": False, "error": f"Credentials error: {str(e)}"}

        def _delete_event():
            service = build("calendar", "v3", credentials=creds, cache_discovery=False)
            try:
                service.events().delete(calendarId="primary", eventId=event_id).execute()
                return {"success": True}
            except HttpError as e:
                # If already deleted on Google Calendar (404 or 410 Gone)
                if e.resp.status in (404, 410):
                    return {"success": True, "already_deleted": True}
                raise e

        try:
            res = await asyncio.to_thread(_delete_event)
            return res
        except HttpError as e:
            return {
                "success": False,
                "error": f"Google Calendar API HttpError: {str(e)}",
                "status_code": e.resp.status,
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to delete event from Google Calendar: {str(e)}",
            }

