from datetime import datetime, timezone
from dataclasses import replace
from urllib.parse import parse_qs, urlparse

from app.config import get_settings
from app.services.google import (
    BASE_GOOGLE_SCOPES,
    GoogleCalendarProvider,
    build_google_auth_url,
    google_oauth_state_hash,
    google_scopes,
    missing_google_scopes,
    new_google_oauth_state,
)
from app.services.providers import CalendarEventRequest


def test_google_oauth_url_requests_gmail_calendar_and_offline_access(monkeypatch) -> None:
    monkeypatch.setenv("GOOGLE_OAUTH_CLIENT_ID", "client-id")
    monkeypatch.setenv("GOOGLE_OAUTH_CLIENT_SECRET", "client-secret")
    monkeypatch.setenv("GOOGLE_OAUTH_REDIRECT_URI", "http://127.0.0.1:8005/api/integrations/google/callback")

    url = build_google_auth_url(get_settings(), state="known-state")
    params = parse_qs(urlparse(url).query)
    scopes = params["scope"][0].split()

    assert params["access_type"] == ["offline"]
    assert params["prompt"] == ["select_account consent"]
    assert params["state"] == ["known-state"]
    for scope in google_scopes(get_settings()):
        assert scope in scopes


def test_google_oauth_url_can_hint_workspace_account(monkeypatch) -> None:
    monkeypatch.setenv("GOOGLE_OAUTH_CLIENT_ID", "client-id")
    monkeypatch.setenv("GOOGLE_OAUTH_CLIENT_SECRET", "client-secret")
    monkeypatch.setenv("GOOGLE_OAUTH_REDIRECT_URI", "http://127.0.0.1:8005/api/integrations/google/callback")
    monkeypatch.setenv("GOOGLE_OAUTH_HOSTED_DOMAIN", "essentialresourcing.co.uk")
    monkeypatch.setenv("GOOGLE_OAUTH_LOGIN_HINT", "david@essentialresourcing.co.uk")

    url = build_google_auth_url(get_settings(), state="known-state")
    params = parse_qs(urlparse(url).query)

    assert params["hd"] == ["essentialresourcing.co.uk"]
    assert params["login_hint"] == ["david@essentialresourcing.co.uk"]


def test_google_oauth_state_hash_is_stable_and_secret_bound(monkeypatch) -> None:
    monkeypatch.setenv("SESSION_SECRET", "session-secret-one")
    settings = get_settings()
    state = new_google_oauth_state()

    assert google_oauth_state_hash(settings, state) == google_oauth_state_hash(settings, state)
    assert google_oauth_state_hash(settings, state) != google_oauth_state_hash(settings, state + "x")


def test_google_scopes_are_feature_based(monkeypatch) -> None:
    monkeypatch.setenv("ENABLE_GMAIL_REPLY_SYNC", "false")
    monkeypatch.setenv("CHECK_RECRUITER_CALENDAR_CONFLICTS", "false")
    minimal_scopes = google_scopes(get_settings())

    assert "https://www.googleapis.com/auth/gmail.send" in minimal_scopes
    assert "https://www.googleapis.com/auth/calendar.events" in minimal_scopes
    assert "https://www.googleapis.com/auth/gmail.readonly" not in minimal_scopes
    assert "https://www.googleapis.com/auth/calendar.freebusy" not in minimal_scopes
    for scope in BASE_GOOGLE_SCOPES:
        assert scope in minimal_scopes

    monkeypatch.setenv("ENABLE_GMAIL_REPLY_SYNC", "true")
    monkeypatch.setenv("CHECK_RECRUITER_CALENDAR_CONFLICTS", "true")
    full_scopes = google_scopes(get_settings())

    assert "https://www.googleapis.com/auth/gmail.readonly" in full_scopes
    assert "https://www.googleapis.com/auth/calendar.freebusy" in full_scopes


def test_google_missing_scopes_accepts_userinfo_aliases(monkeypatch) -> None:
    monkeypatch.setenv("ENABLE_GMAIL_REPLY_SYNC", "true")
    monkeypatch.setenv("CHECK_RECRUITER_CALENDAR_CONFLICTS", "false")
    granted_scopes = [
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/calendar.events",
    ]

    assert missing_google_scopes(get_settings(), granted_scopes) == []


def test_google_calendar_events_are_transparent_unless_recruiter_conflicts_enabled() -> None:
    settings = get_settings()
    provider = GoogleCalendarProvider(db=None, settings=settings)
    request = CalendarEventRequest(
        title="Sarah Jones - PPC Account Director - WPP",
        description="Interview logistics only.",
        start_at=datetime(2026, 8, 19, 13, 0, tzinfo=timezone.utc),
        end_at=datetime(2026, 8, 19, 13, 45, tzinfo=timezone.utc),
        timezone="Europe/London",
        attendee_emails=["sarah@example.com", "greg@example.com"],
        format="Google Meet",
        idempotency_key="test-key",
    )

    assert provider._event_body(request)["transparency"] == "transparent"

    attending_provider = GoogleCalendarProvider(
        db=None,
        settings=replace(settings, check_recruiter_calendar_conflicts=True),
    )
    assert attending_provider._event_body(request)["transparency"] == "opaque"
