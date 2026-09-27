from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import IntegrationConnection, OAuthState
from app.security import require_user
from app.services.google import (
    build_google_auth_url,
    exchange_google_code,
    google_connection,
    google_oauth_state_hash,
    google_scopes,
    missing_google_scopes,
    new_google_oauth_state,
)
from app.services.gmail_sync import sync_gmail_replies as sync_gmail_replies_service


router = APIRouter(prefix="/api/integrations", tags=["integrations"])


def _latest_google_connection(db: Session) -> Optional[IntegrationConnection]:
    return (
        db.query(IntegrationConnection)
        .filter(IntegrationConnection.provider_name == "google")
        .order_by(IntegrationConnection.updated_at.desc())
        .first()
    )


def _missing_google_env() -> list[str]:
    settings = get_settings()
    return [
        name
        for name, configured in [
            ("GOOGLE_OAUTH_CLIENT_ID", bool(settings.google_oauth_client_id)),
            ("GOOGLE_OAUTH_CLIENT_SECRET", bool(settings.google_oauth_client_secret)),
            ("GOOGLE_OAUTH_REDIRECT_URI", bool(settings.google_oauth_redirect_uri)),
        ]
        if not configured
    ]


def _google_status(db: Session) -> dict:
    settings = get_settings()
    connection = _latest_google_connection(db)
    connected = bool(connection and connection.status == "connected")
    required_scopes = google_scopes(settings)
    granted_scopes = connection.scopes if connection else []
    missing_scopes = missing_google_scopes(settings, granted_scopes)
    return {
        "configured": settings.google_oauth_configured,
        "connected": connected,
        "status": connection.status if connection else "not_connected",
        "account_email": connection.account_email if connection else None,
        "missing_env": _missing_google_env(),
        "scopes": granted_scopes,
        "required_scopes": required_scopes,
        "missing_scopes": missing_scopes if connected else [],
        "workspace_posture": "internal_or_trusted_workspace_app_recommended",
        "last_error": connection.last_error if connection else None,
    }


@router.get("")
def integrations_status(
    db: Session = Depends(get_db),
    user_email: str = Depends(require_user),
) -> dict:
    del user_email
    settings = get_settings()
    google = _google_status(db)
    smtp_missing = [
        name
        for name, configured in [
            ("SMTP_HOST", bool(settings.smtp_host)),
            ("SMTP_PORT", bool(settings.smtp_port)),
            ("SMTP_USERNAME", bool(settings.smtp_username)),
            ("SMTP_PASSWORD", bool(settings.smtp_password)),
            ("SMTP_FROM_EMAIL", bool(settings.smtp_from_email)),
        ]
        if not configured
    ]

    email_real = (settings.email_provider == "smtp" and settings.smtp_configured) or (
        settings.email_provider == "gmail" and google["configured"] and google["connected"]
    )
    calendar_real = settings.calendar_provider == "google" and google["configured"] and google["connected"]

    email_status = "mock_only"
    if settings.email_provider == "smtp":
        email_status = "real_delivery_enabled" if settings.smtp_configured else "missing_configuration"
    elif settings.email_provider == "gmail":
        if not google["configured"]:
            email_status = "missing_google_configuration"
        elif not google["connected"]:
            email_status = "needs_google_connection"
        else:
            email_status = "real_delivery_enabled"

    calendar_status = "mock_only"
    if settings.calendar_provider == "google":
        if not google["configured"]:
            calendar_status = "missing_google_configuration"
        elif not google["connected"]:
            calendar_status = "needs_google_connection"
        else:
            calendar_status = "real_calendar_enabled"

    email_missing_env = []
    if settings.email_provider == "smtp":
        email_missing_env = smtp_missing
    elif settings.email_provider == "gmail":
        email_missing_env = google["missing_env"]

    calendar_missing_env = google["missing_env"] if settings.calendar_provider == "google" else []

    return {
        "google": google,
        "email": {
            "provider": settings.email_provider,
            "configured": email_real if settings.email_provider in {"smtp", "gmail"} else True,
            "delivers_real_email": email_real,
            "status": email_status,
            "missing_env": email_missing_env,
            "test_provider": "gmail" if settings.email_provider == "gmail" else "smtp",
            "production_recommendation": "Use Google OAuth-backed Gmail sending and reply sync for first production tests.",
        },
        "calendar": {
            "provider": settings.calendar_provider,
            "configured": calendar_real if settings.calendar_provider == "google" else True,
            "creates_real_calendar_events": calendar_real,
            "status": calendar_status,
            "missing_env": calendar_missing_env,
            "recruiter_conflict_checks": settings.check_recruiter_calendar_conflicts,
        },
        "automation": {
            "enabled": settings.enable_automation_worker,
            "gmail_reply_sync_enabled": settings.enable_gmail_reply_sync,
            "due_work_interval_seconds": settings.worker_due_work_interval_seconds,
            "gmail_sync_interval_seconds": settings.worker_gmail_sync_interval_seconds,
        },
        "crm": {
            "connector": settings.crm_connector,
            "loxo_dependency": False,
            "status": "manual_only",
        },
        "required_apis_later": {
            "microsoft": [
                "Microsoft Graph",
                "Entra app registration",
                "Mail.Send for sending",
                "Mail.Read or Mail.ReadWrite for reply monitoring",
                "Calendars.ReadWrite for Outlook invites",
            ],
            "background_jobs": [
                "Webhook verification or scheduled polling",
                "Retry queues",
                "Idempotency keys",
                "Failure alerts",
            ],
        },
    }


@router.get("/google/start")
def google_oauth_start(
    db: Session = Depends(get_db),
    user_email: str = Depends(require_user),
) -> dict:
    settings = get_settings()
    if not settings.google_oauth_configured:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google OAuth is not configured. Add GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET first.",
        )
    state = new_google_oauth_state()
    db.add(
        OAuthState(
            provider_name="google",
            state_hash=google_oauth_state_hash(settings, state),
            user_email=user_email,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
        ),
    )
    db.commit()
    return {"auth_url": build_google_auth_url(settings, state)}


@router.get("/google/callback")
def google_oauth_callback(
    code: Optional[str] = None,
    error: Optional[str] = None,
    state: Optional[str] = None,
    db: Session = Depends(get_db),
) -> RedirectResponse:
    settings = get_settings()
    if error or not code or not state:
        return RedirectResponse(f"{settings.app_base_url.rstrip('/')}?google=error")
    try:
        state_hash = google_oauth_state_hash(settings, state)
        stored_state = (
            db.query(OAuthState)
            .filter(
                OAuthState.provider_name == "google",
                OAuthState.state_hash == state_hash,
                OAuthState.used_at.is_(None),
            )
            .one_or_none()
        )
        now = datetime.now(timezone.utc)
        if not stored_state:
            return RedirectResponse(f"{settings.app_base_url.rstrip('/')}?google=error")
        expires_at = stored_state.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < now:
            return RedirectResponse(f"{settings.app_base_url.rstrip('/')}?google=error")
        stored_state.used_at = now
        exchange_google_code(db, settings, code)
        db.commit()
    except Exception:
        db.rollback()
        return RedirectResponse(f"{settings.app_base_url.rstrip('/')}?google=error")
    return RedirectResponse(f"{settings.app_base_url.rstrip('/')}?google=connected")


@router.post("/gmail/sync")
def sync_gmail_replies(
    db: Session = Depends(get_db),
    user_email: str = Depends(require_user),
) -> dict:
    settings = get_settings()
    if not settings.google_oauth_configured or not google_connection(db):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Connect Google before syncing Gmail replies.")

    try:
        result = sync_gmail_replies_service(db, settings, user_email)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Gmail sync failed: {exc}") from exc

    return result
