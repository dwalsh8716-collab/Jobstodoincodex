from datetime import datetime, timezone
from email.utils import parseaddr
import re
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.config import Settings
from app.enums import InterviewState, ParticipantType
from app.models import Interview, InterviewParticipant, Message
from app.services.google import (
    get_gmail_message,
    google_connection,
    header_value,
    list_recent_gmail_messages,
    plain_text_body,
)
from app.services.workflow import WorkflowService


def sync_gmail_replies(db: Session, settings: Settings, actor_email: str, query: str = "newer_than:14d") -> dict:
    if not settings.enable_gmail_reply_sync:
        return {
            "synced": 0,
            "skipped_duplicate": 0,
            "skipped_unmatched": 0,
            "skipped_own_mail": 0,
            "skipped_not_connected": 0,
            "skipped_disabled": 1,
        }
    if not settings.google_oauth_configured or not google_connection(db):
        return {
            "synced": 0,
            "skipped_duplicate": 0,
            "skipped_unmatched": 0,
            "skipped_own_mail": 0,
            "skipped_not_connected": 1,
            "skipped_disabled": 0,
        }

    synced = 0
    skipped_duplicate = 0
    skipped_unmatched = 0
    skipped_own_mail = 0
    service = WorkflowService(settings=settings)
    connection = google_connection(db)
    own_email = (connection.account_email or "").lower() if connection else ""

    refs = list_recent_gmail_messages(db, settings, query=query)
    for ref in refs:
        if db.query(Message).filter(Message.provider_message_id == ref["id"]).first():
            skipped_duplicate += 1
            continue
        message = get_gmail_message(db, settings, ref["id"])
        sender_email = parseaddr(header_value(message, "From") or "")[1].lower()
        if sender_email and sender_email == own_email:
            skipped_own_mail += 1
            continue
        workflow_public_id = _workflow_id_from_message(message)
        participant = _match_participant(db, sender_email, workflow_public_id)
        if not participant:
            skipped_unmatched += 1
            continue
        interview = (
            db.query(Interview)
            .options(
                joinedload(Interview.candidate),
                joinedload(Interview.client_contact),
                joinedload(Interview.company),
                joinedload(Interview.job),
                joinedload(Interview.participants),
                joinedload(Interview.reminders),
            )
            .filter(Interview.id == participant.interview_id)
            .one()
        )
        service.receive_mock_reply(
            db,
            interview,
            participant.participant_type,
            plain_text_body(message),
            actor_email,
            received_at=_received_at(message),
            channel="gmail",
            provider_message_id=message["id"],
            provider_thread_id=message.get("threadId"),
        )
        synced += 1

    return {
        "synced": synced,
        "skipped_duplicate": skipped_duplicate,
        "skipped_unmatched": skipped_unmatched,
        "skipped_own_mail": skipped_own_mail,
        "skipped_not_connected": 0,
        "skipped_disabled": 0,
    }


def _workflow_id_from_message(message: dict) -> Optional[str]:
    header_id = header_value(message, "X-ER-Workflow-ID")
    if header_id:
        return header_id.strip()
    subject = header_value(message, "Subject") or ""
    match = re.search(r"\[(ERINT-[A-Z0-9]+)\]", subject)
    return match.group(1) if match else None


def _match_participant(
    db: Session,
    sender_email: str,
    workflow_public_id: Optional[str],
) -> Optional[InterviewParticipant]:
    if not sender_email:
        return None

    query = (
        db.query(InterviewParticipant)
        .join(Interview, InterviewParticipant.interview_id == Interview.id)
        .filter(
            func.lower(InterviewParticipant.email) == sender_email,
            InterviewParticipant.participant_type.in_(
                [ParticipantType.CANDIDATE.value, ParticipantType.CLIENT_CONTACT.value],
            ),
        )
    )
    if workflow_public_id:
        return query.filter(Interview.workflow_public_id == workflow_public_id).one_or_none()

    active_states = [
        InterviewState.AWAITING_BOTH.value,
        InterviewState.AWAITING_CANDIDATE_AVAILABILITY.value,
        InterviewState.AWAITING_CLIENT_AVAILABILITY.value,
        InterviewState.SCHEDULED.value,
        InterviewState.RESCHEDULE_REQUESTED.value,
        InterviewState.CANCELLATION_REQUESTED.value,
    ]
    matches = query.filter(Interview.state.in_(active_states)).limit(2).all()
    return matches[0] if len(matches) == 1 else None


def _received_at(message: dict) -> datetime:
    internal_date = message.get("internalDate")
    if not internal_date:
        return datetime.now(timezone.utc)
    return datetime.fromtimestamp(int(internal_date) / 1000, tz=timezone.utc)
