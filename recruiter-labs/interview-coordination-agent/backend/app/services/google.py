from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
import base64
import hashlib
import hmac
import secrets
import uuid
from typing import Dict, Iterable, List, Optional
from urllib.parse import urlencode

import httpx
from sqlalchemy.orm import Session

from app.config import Settings
from app.models import IntegrationConnection
from app.services.crypto import decrypt_text, encrypt_text
from app.services.providers import (
    CalendarBusyWindow,
    CalendarEventRequest,
    CalendarEventResult,
    EmailSendRequest,
    EmailSendResult,
)


GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"

BASE_GOOGLE_SCOPES = [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/calendar.events",
]


GOOGLE_SCOPE_ALIASES = {
    "email": {"email", "https://www.googleapis.com/auth/userinfo.email"},
    "profile": {"profile", "https://www.googleapis.com/auth/userinfo.profile"},
}


def google_scopes(settings: Settings) -> List[str]:
    scopes = list(BASE_GOOGLE_SCOPES)
    if settings.enable_gmail_reply_sync:
        scopes.append("https://www.googleapis.com/auth/gmail.readonly")
    if settings.check_recruiter_calendar_conflicts:
        scopes.append("https://www.googleapis.com/auth/calendar.freebusy")
    return scopes


def google_scope_granted(required_scope: str, granted_scopes: Iterable[str]) -> bool:
    granted = set(granted_scopes)
    aliases = GOOGLE_SCOPE_ALIASES.get(required_scope, {required_scope})
    return bool(aliases.intersection(granted))


def missing_google_scopes(settings: Settings, granted_scopes: Iterable[str]) -> List[str]:
    return [scope for scope in google_scopes(settings) if not google_scope_granted(scope, granted_scopes)]


def google_connection(db: Session, provider_type: str = "google") -> Optional[IntegrationConnection]:
    return (
        db.query(IntegrationConnection)
        .filter(
            IntegrationConnection.provider_name == "google",
            IntegrationConnection.status == "connected",
        )
        .order_by(IntegrationConnection.updated_at.desc())
        .first()
    )


def new_google_oauth_state() -> str:
    return secrets.token_urlsafe(32)


def google_oauth_state_hash(settings: Settings, state: str) -> str:
    secret = settings.session_secret or settings.google_oauth_client_secret or "development-oauth-state"
    return hmac.new(secret.encode("utf-8"), state.encode("utf-8"), hashlib.sha256).hexdigest()


def build_google_auth_url(settings: Settings, state: Optional[str] = None) -> str:
    state = state or new_google_oauth_state()
    params = {
        "client_id": settings.google_oauth_client_id,
        "redirect_uri": settings.google_oauth_redirect_uri,
        "response_type": "code",
        "scope": " ".join(google_scopes(settings)),
        "access_type": "offline",
        "prompt": "select_account consent",
        "include_granted_scopes": "true",
        "state": state,
    }
    if settings.google_oauth_hosted_domain:
        params["hd"] = settings.google_oauth_hosted_domain
    if settings.google_oauth_login_hint:
        params["login_hint"] = settings.google_oauth_login_hint
    return f"{GOOGLE_AUTH_URL}?{urlencode(params)}"


def exchange_google_code(db: Session, settings: Settings, code: str) -> IntegrationConnection:
    with httpx.Client(timeout=20) as client:
        token_response = client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.google_oauth_client_id,
                "client_secret": settings.google_oauth_client_secret,
                "redirect_uri": settings.google_oauth_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        token_response.raise_for_status()
        token_data = token_response.json()

        userinfo_response = client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {token_data['access_token']}"},
        )
        userinfo_response.raise_for_status()
        userinfo = userinfo_response.json()

    expires_at = datetime.now(timezone.utc) + timedelta(seconds=int(token_data.get("expires_in", 3600)) - 60)
    existing = google_connection(db)
    connection = existing or IntegrationConnection(
        provider_type="google",
        provider_name="google",
        status="connected",
    )
    connection.account_email = userinfo.get("email")
    connection.scopes = token_data.get("scope", " ".join(google_scopes(settings))).split()
    connection.access_token_ciphertext = encrypt_text(token_data["access_token"])
    if token_data.get("refresh_token"):
        connection.refresh_token_ciphertext = encrypt_text(token_data["refresh_token"])
    connection.expires_at = expires_at
    connection.status = "connected"
    connection.last_error = None
    db.add(connection)
    db.flush()
    return connection


def get_google_access_token(db: Session, settings: Settings) -> str:
    connection = google_connection(db)
    if not connection:
        raise ValueError("Google is not connected.")

    access_token = decrypt_text(connection.access_token_ciphertext)
    expires_at = connection.expires_at
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if access_token and expires_at and expires_at > datetime.now(timezone.utc) + timedelta(minutes=2):
        return access_token

    refresh_token = decrypt_text(connection.refresh_token_ciphertext)
    if not refresh_token:
        connection.status = "needs_reconnect"
        connection.last_error = "Google refresh token is missing. Reconnect Google."
        db.add(connection)
        db.flush()
        raise ValueError(connection.last_error)

    with httpx.Client(timeout=20) as client:
        response = client.post(
            GOOGLE_TOKEN_URL,
            data={
                "client_id": settings.google_oauth_client_id,
                "client_secret": settings.google_oauth_client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            },
        )
        if response.status_code >= 400:
            connection.status = "needs_reconnect"
            connection.last_error = f"Google token refresh failed with status {response.status_code}."
            db.add(connection)
            db.flush()
            raise ValueError(connection.last_error)
        token_data = response.json()

    connection.access_token_ciphertext = encrypt_text(token_data["access_token"])
    connection.expires_at = datetime.now(timezone.utc) + timedelta(seconds=int(token_data.get("expires_in", 3600)) - 60)
    connection.status = "connected"
    connection.last_error = None
    db.add(connection)
    db.flush()
    return token_data["access_token"]


class GmailEmailProvider:
    provider = "gmail"

    def __init__(self, db: Session, settings: Settings) -> None:
        self.db = db
        self.settings = settings
        connection = google_connection(db)
        self.from_email = connection.account_email if connection and connection.account_email else "me"

    def send_message(self, request: EmailSendRequest) -> EmailSendResult:
        access_token = get_google_access_token(self.db, self.settings)
        message = EmailMessage()
        message["To"] = ", ".join(request.to)
        message["From"] = self.from_email
        message["Subject"] = f"{request.subject} [{request.workflow_public_id}]"
        message["X-ER-Workflow-ID"] = request.workflow_public_id
        message.set_content(request.body)

        encoded = base64.urlsafe_b64encode(message.as_bytes()).decode("ascii")
        with httpx.Client(timeout=20) as client:
            response = client.post(
                "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
                headers={"Authorization": f"Bearer {access_token}"},
                json={"raw": encoded},
            )
            response.raise_for_status()
            data = response.json()

        return EmailSendResult(
            provider_message_id=data["id"],
            provider_thread_id=data.get("threadId", data["id"]),
            sent_at=datetime.utcnow(),
        )


class GoogleCalendarProvider:
    provider = "google"

    def __init__(self, db: Session, settings: Settings) -> None:
        self.db = db
        self.settings = settings

    def busy_windows(self, time_min: datetime, time_max: datetime) -> List[CalendarBusyWindow]:
        access_token = get_google_access_token(self.db, self.settings)
        body = {
            "timeMin": time_min.astimezone(timezone.utc).isoformat(),
            "timeMax": time_max.astimezone(timezone.utc).isoformat(),
            "timeZone": "UTC",
            "items": [{"id": self.settings.google_calendar_id}],
        }
        with httpx.Client(timeout=20) as client:
            response = client.post(
                "https://www.googleapis.com/calendar/v3/freeBusy",
                headers={"Authorization": f"Bearer {access_token}"},
                json=body,
            )
            response.raise_for_status()
            data = response.json()

        calendar = data.get("calendars", {}).get(self.settings.google_calendar_id, {})
        if calendar.get("errors"):
            reasons = ", ".join(error.get("reason", "unknown") for error in calendar["errors"])
            raise ValueError(f"Google Calendar free/busy failed: {reasons}")

        return [
            CalendarBusyWindow(
                start_at=datetime.fromisoformat(item["start"].replace("Z", "+00:00")),
                end_at=datetime.fromisoformat(item["end"].replace("Z", "+00:00")),
                timezone="UTC",
                source_id=f"google_busy_{index}",
            )
            for index, item in enumerate(calendar.get("busy", []))
        ]

    def _event_body(self, request: CalendarEventRequest) -> Dict:
        body: Dict = {
            "summary": request.title,
            "description": request.description,
            "start": {"dateTime": request.start_at.isoformat(), "timeZone": request.timezone},
            "end": {"dateTime": request.end_at.isoformat(), "timeZone": request.timezone},
            "attendees": [{"email": email} for email in request.attendee_emails],
            "transparency": "opaque" if self.settings.check_recruiter_calendar_conflicts else "transparent",
        }
        if request.location:
            body["location"] = request.location

        if request.format == "Google Meet":
            body["conferenceData"] = {
                "createRequest": {
                    "requestId": request.idempotency_key or f"er-{uuid.uuid4().hex}",
                    "conferenceSolutionKey": {"type": "hangoutsMeet"},
                },
            }
        return body

    def create_event(self, request: CalendarEventRequest) -> CalendarEventResult:
        access_token = get_google_access_token(self.db, self.settings)
        body = self._event_body(request)
        wants_meet = request.format == "Google Meet"
        params = {"sendUpdates": "all"}
        if wants_meet:
            params["conferenceDataVersion"] = "1"

        with httpx.Client(timeout=20) as client:
            response = client.post(
                f"https://www.googleapis.com/calendar/v3/calendars/{self.settings.google_calendar_id}/events",
                params=params,
                headers={"Authorization": f"Bearer {access_token}"},
                json=body,
            )
            response.raise_for_status()
            data = response.json()

        meeting_url = data.get("hangoutLink") or _meet_link_from_conference(data.get("conferenceData", {}))
        return CalendarEventResult(
            provider_calendar_id=self.settings.google_calendar_id,
            provider_event_id=data["id"],
            meeting_url=meeting_url,
            location=meeting_url or request.location,
            created_at=datetime.utcnow(),
        )

    def update_event(
        self,
        provider_event_id: str,
        request: CalendarEventRequest,
        provider_calendar_id: Optional[str] = None,
    ) -> CalendarEventResult:
        access_token = get_google_access_token(self.db, self.settings)
        calendar_id = provider_calendar_id or self.settings.google_calendar_id
        wants_meet = request.format == "Google Meet"
        params = {"sendUpdates": "all"}
        if wants_meet:
            params["conferenceDataVersion"] = "1"
        with httpx.Client(timeout=20) as client:
            response = client.put(
                f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events/{provider_event_id}",
                params=params,
                headers={"Authorization": f"Bearer {access_token}"},
                json=self._event_body(request),
            )
            response.raise_for_status()
            data = response.json()

        meeting_url = data.get("hangoutLink") or _meet_link_from_conference(data.get("conferenceData", {}))
        return CalendarEventResult(
            provider_calendar_id=calendar_id,
            provider_event_id=data["id"],
            meeting_url=meeting_url,
            location=meeting_url or request.location,
            created_at=datetime.utcnow(),
        )

    def cancel_event(self, provider_event_id: str, provider_calendar_id: Optional[str] = None) -> None:
        access_token = get_google_access_token(self.db, self.settings)
        calendar_id = provider_calendar_id or self.settings.google_calendar_id
        with httpx.Client(timeout=20) as client:
            response = client.delete(
                f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events/{provider_event_id}",
                params={"sendUpdates": "all"},
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if response.status_code in {404, 410}:
                return
            response.raise_for_status()


def _meet_link_from_conference(conference_data: Dict) -> Optional[str]:
    for entry_point in conference_data.get("entryPoints", []):
        if entry_point.get("entryPointType") == "video":
            return entry_point.get("uri")
    return None


def list_recent_gmail_messages(db: Session, settings: Settings, query: str = "newer_than:14d") -> List[Dict]:
    access_token = get_google_access_token(db, settings)
    with httpx.Client(timeout=20) as client:
        response = client.get(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"q": query, "maxResults": 50},
        )
        response.raise_for_status()
        return response.json().get("messages", [])


def get_gmail_message(db: Session, settings: Settings, message_id: str) -> Dict:
    access_token = get_google_access_token(db, settings)
    with httpx.Client(timeout=20) as client:
        response = client.get(
            f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{message_id}",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"format": "full"},
        )
        response.raise_for_status()
        return response.json()


def header_value(message: Dict, name: str) -> Optional[str]:
    headers = message.get("payload", {}).get("headers", [])
    for header in headers:
        if header.get("name", "").lower() == name.lower():
            return header.get("value")
    return None


def plain_text_body(message: Dict) -> str:
    payload = message.get("payload", {})
    body = _body_data(payload)
    if body:
        return body
    for part in _walk_parts(payload.get("parts", [])):
        if part.get("mimeType") == "text/plain":
            body = _body_data(part)
            if body:
                return body
    return message.get("snippet", "")


def _walk_parts(parts: Iterable[Dict]) -> Iterable[Dict]:
    for part in parts:
        yield part
        yield from _walk_parts(part.get("parts", []))


def _body_data(part: Dict) -> str:
    data = part.get("body", {}).get("data")
    if not data:
        return ""
    padded = data + "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(padded.encode("ascii")).decode("utf-8", errors="replace")
