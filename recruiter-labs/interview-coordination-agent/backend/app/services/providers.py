from dataclasses import dataclass
from datetime import datetime
from email.message import EmailMessage
import uuid
import smtplib
from typing import List, Optional, Protocol

from app.config import Settings


@dataclass(frozen=True)
class EmailSendRequest:
    to: List[str]
    subject: str
    body: str
    workflow_public_id: str


@dataclass(frozen=True)
class EmailSendResult:
    provider_message_id: str
    provider_thread_id: str
    sent_at: datetime


class EmailProvider(Protocol):
    provider: str
    from_email: str

    def send_message(self, request: EmailSendRequest) -> EmailSendResult:
        ...


@dataclass(frozen=True)
class CalendarEventRequest:
    title: str
    description: str
    start_at: datetime
    end_at: datetime
    timezone: str
    attendee_emails: List[str]
    format: str
    location: Optional[str] = None
    idempotency_key: Optional[str] = None


@dataclass(frozen=True)
class CalendarEventResult:
    provider_calendar_id: str
    provider_event_id: str
    meeting_url: Optional[str]
    location: Optional[str]
    created_at: datetime


@dataclass(frozen=True)
class CalendarBusyWindow:
    start_at: datetime
    end_at: datetime
    timezone: str
    source_id: str


class CalendarProvider(Protocol):
    provider: str

    def busy_windows(self, time_min: datetime, time_max: datetime) -> List[CalendarBusyWindow]:
        ...

    def create_event(self, request: CalendarEventRequest) -> CalendarEventResult:
        ...

    def update_event(
        self,
        provider_event_id: str,
        request: CalendarEventRequest,
        provider_calendar_id: Optional[str] = None,
    ) -> CalendarEventResult:
        ...

    def cancel_event(self, provider_event_id: str, provider_calendar_id: Optional[str] = None) -> None:
        ...


class MockEmailProvider:
    provider = "mock"
    from_email = "david@essentialresourcing.co.uk"

    def send_message(self, request: EmailSendRequest) -> EmailSendResult:
        now = datetime.utcnow()
        short_id = uuid.uuid4().hex[:12]
        return EmailSendResult(
            provider_message_id=f"mock_msg_{short_id}",
            provider_thread_id=f"mock_thread_{request.workflow_public_id}",
            sent_at=now,
        )


class SMTPEmailProvider:
    provider = "smtp"

    def __init__(self, settings: Settings) -> None:
        self.host = settings.smtp_host
        self.port = settings.smtp_port
        self.username = settings.smtp_username
        self.password = settings.smtp_password
        self.from_email = settings.smtp_from_email
        self.from_name = settings.smtp_from_name
        self.use_tls = settings.smtp_use_tls
        self.use_ssl = settings.smtp_use_ssl

    def send_message(self, request: EmailSendRequest) -> EmailSendResult:
        message = EmailMessage()
        message["From"] = f"{self.from_name} <{self.from_email}>"
        message["To"] = ", ".join(request.to)
        message["Subject"] = request.subject
        message["X-ER-Workflow-ID"] = request.workflow_public_id
        message.set_content(request.body)

        if self.use_ssl:
            with smtplib.SMTP_SSL(self.host, self.port, timeout=20) as smtp:
                smtp.login(self.username, self.password)
                smtp.send_message(message)
        else:
            with smtplib.SMTP(self.host, self.port, timeout=20) as smtp:
                if self.use_tls:
                    smtp.starttls()
                smtp.login(self.username, self.password)
                smtp.send_message(message)

        now = datetime.utcnow()
        short_id = uuid.uuid4().hex[:12]
        return EmailSendResult(
            provider_message_id=f"smtp_msg_{short_id}",
            provider_thread_id=f"smtp_thread_{request.workflow_public_id}",
            sent_at=now,
        )


class MisconfiguredEmailProvider:
    provider = "misconfigured"

    def __init__(self, message: str, from_email: str = "david@essentialresourcing.co.uk") -> None:
        self.message = message
        self.from_email = from_email

    def send_message(self, request: EmailSendRequest) -> EmailSendResult:
        del request
        raise ValueError(self.message)


def build_email_provider(settings: Settings, db=None) -> EmailProvider:
    if settings.email_provider == "gmail":
        if db is None:
            return MisconfiguredEmailProvider("Gmail sending needs a database session.")
        from app.services.google import GmailEmailProvider, google_connection

        if not settings.google_oauth_configured:
            return MisconfiguredEmailProvider("Gmail is selected but Google OAuth is not configured.")
        if not google_connection(db):
            return MisconfiguredEmailProvider("Gmail is selected but Google is not connected.")
        return GmailEmailProvider(db, settings)
    if settings.email_provider == "smtp":
        if not settings.smtp_configured:
            return MisconfiguredEmailProvider(
                "SMTP email is selected but SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD and SMTP_FROM_EMAIL are not all configured.",
                settings.smtp_from_email or "david@essentialresourcing.co.uk",
            )
        return SMTPEmailProvider(settings)
    return MockEmailProvider()


class MisconfiguredCalendarProvider:
    provider = "misconfigured"

    def __init__(self, message: str) -> None:
        self.message = message

    def create_event(self, request: CalendarEventRequest) -> CalendarEventResult:
        del request
        raise ValueError(self.message)

    def busy_windows(self, time_min: datetime, time_max: datetime) -> List[CalendarBusyWindow]:
        del time_min, time_max
        raise ValueError(self.message)

    def update_event(
        self,
        provider_event_id: str,
        request: CalendarEventRequest,
        provider_calendar_id: Optional[str] = None,
    ) -> CalendarEventResult:
        del provider_event_id, request, provider_calendar_id
        raise ValueError(self.message)

    def cancel_event(self, provider_event_id: str, provider_calendar_id: Optional[str] = None) -> None:
        del provider_event_id, provider_calendar_id
        raise ValueError(self.message)


def build_calendar_provider(settings: Settings, db=None) -> CalendarProvider:
    if settings.calendar_provider == "google":
        if db is None:
            return MisconfiguredCalendarProvider("Google Calendar needs a database session.")
        from app.services.google import GoogleCalendarProvider, google_connection

        if not settings.google_oauth_configured:
            return MisconfiguredCalendarProvider("Google Calendar is selected but Google OAuth is not configured.")
        if not google_connection(db):
            return MisconfiguredCalendarProvider("Google Calendar is selected but Google is not connected.")
        return GoogleCalendarProvider(db, settings)
    return MockCalendarProvider()


class MockCalendarProvider:
    provider = "mock"

    def __init__(self, busy: Optional[List[CalendarBusyWindow]] = None) -> None:
        self._busy = busy or []

    def busy_windows(self, time_min: datetime, time_max: datetime) -> List[CalendarBusyWindow]:
        return [
            window
            for window in self._busy
            if window.start_at < time_max and window.end_at > time_min
        ]

    def create_event(self, request: CalendarEventRequest) -> CalendarEventResult:
        short_id = uuid.uuid4().hex[:12]
        meeting_url = None
        location = request.location
        if request.format in ["Google Meet", "Microsoft Teams", "Zoom"]:
            meeting_url = f"https://meet.example.test/{short_id}"
            location = meeting_url
        return CalendarEventResult(
            provider_calendar_id="mock_primary",
            provider_event_id=f"mock_event_{short_id}",
            meeting_url=meeting_url,
            location=location,
            created_at=datetime.utcnow(),
        )

    def update_event(
        self,
        provider_event_id: str,
        request: CalendarEventRequest,
        provider_calendar_id: Optional[str] = None,
    ) -> CalendarEventResult:
        result = self.create_event(request)
        return CalendarEventResult(
            provider_calendar_id=provider_calendar_id or result.provider_calendar_id,
            provider_event_id=provider_event_id,
            meeting_url=result.meeting_url,
            location=result.location,
            created_at=result.created_at,
        )

    def cancel_event(self, provider_event_id: str, provider_calendar_id: Optional[str] = None) -> None:
        del provider_event_id, provider_calendar_id
