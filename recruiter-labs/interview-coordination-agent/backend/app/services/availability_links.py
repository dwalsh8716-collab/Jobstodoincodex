from datetime import datetime, timedelta, timezone
import hashlib
import secrets
from typing import Optional

from sqlalchemy.orm import Session

from app.config import Settings
from app.models import AvailabilityLink, Interview, InterviewParticipant


def _token_hash(raw_token: str, settings: Settings) -> str:
    secret = settings.session_secret or "local-development-secret"
    return hashlib.sha256(f"{secret}:{raw_token}".encode("utf-8")).hexdigest()


def create_availability_link(
    db: Session,
    settings: Settings,
    interview: Interview,
    participant: InterviewParticipant,
    expires_days: int = 14,
) -> str:
    raw_token = secrets.token_urlsafe(32)
    link = AvailabilityLink(
        interview_id=interview.id,
        participant_id=participant.id,
        participant_type=participant.participant_type,
        email=(participant.email or "").lower(),
        token_hash=_token_hash(raw_token, settings),
        expires_at=datetime.now(timezone.utc) + timedelta(days=expires_days),
        status="active",
    )
    db.add(link)
    db.flush()
    return f"{settings.app_base_url.rstrip('/')}/availability/{raw_token}"


def find_active_availability_link(
    db: Session,
    settings: Settings,
    raw_token: str,
) -> Optional[AvailabilityLink]:
    token_hash = _token_hash(raw_token, settings)
    link = db.query(AvailabilityLink).filter(AvailabilityLink.token_hash == token_hash).one_or_none()
    if not link:
        return None

    expires_at = link.expires_at
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if link.revoked_at or link.status not in {"active", "submitted"}:
        return None
    if expires_at and expires_at < datetime.now(timezone.utc):
        link.status = "expired"
        db.add(link)
        db.flush()
        return None
    return link
