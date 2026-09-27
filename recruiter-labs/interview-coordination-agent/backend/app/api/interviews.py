from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import (
    AvailabilityWindow,
    CRMExport,
    Interview,
    InterviewParticipant,
    WorkflowEvent,
)
from app.schemas import (
    ApproveSlotRequest,
    AnonymizeInterviewResponse,
    AvailabilityWindowOut,
    CalendarEventOut,
    CancelInterviewRequest,
    CRMExportOut,
    InterviewDetail,
    InterviewListItem,
    MessageOut,
    MockReplyRequest,
    NewInterviewRequest,
    ProcessDueWorkResponse,
    ReminderOut,
    RetentionRedactionRequest,
    RetentionRedactionResponse,
    WorkflowEventOut,
)
from app.security import require_user
from app.services.workflow import WorkflowService


router = APIRouter(prefix="/api/interviews", tags=["interviews"])


def _dt(value: Optional[datetime]) -> Optional[datetime]:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def _load_interview(db: Session, interview_id: str) -> Interview:
    interview = (
        db.query(Interview)
        .options(
            joinedload(Interview.candidate),
            joinedload(Interview.client_contact),
            joinedload(Interview.company),
            joinedload(Interview.job),
            joinedload(Interview.participants),
            joinedload(Interview.availability_windows).joinedload(AvailabilityWindow.participant),
            joinedload(Interview.messages),
            joinedload(Interview.calendar_events),
            joinedload(Interview.reminders),
            joinedload(Interview.workflow_events),
        )
        .filter(Interview.id == interview_id)
        .one_or_none()
    )
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found.")
    return interview


def to_list_item(interview: Interview) -> InterviewListItem:
    return InterviewListItem(
        id=interview.id,
        workflow_public_id=interview.workflow_public_id,
        state=interview.state,
        candidate_name=interview.candidate.full_name,
        client_name=interview.client_contact.full_name,
        company_name=interview.company.name,
        job_title=interview.job.title,
        stage=interview.stage,
        format=interview.format,
        scheduled_start_at=_dt(interview.scheduled_start_at),
        updated_at=_dt(interview.updated_at) or datetime.now(timezone.utc),
    )


def _participant_lookup(interview: Interview) -> Dict[str, InterviewParticipant]:
    return {participant.id: participant for participant in interview.participants}


def to_detail(db: Session, interview: Interview) -> InterviewDetail:
    participants = _participant_lookup(interview)
    crm_export = (
        db.query(CRMExport)
        .filter(CRMExport.interview_id == interview.id)
        .order_by(CRMExport.created_at.desc())
        .first()
    )
    return InterviewDetail(
        id=interview.id,
        workflow_public_id=interview.workflow_public_id,
        state=interview.state,
        state_reason=interview.state_reason,
        candidate={
            "id": interview.candidate.id,
            "full_name": interview.candidate.full_name,
            "email": interview.candidate.email,
            "mobile": interview.candidate.mobile,
            "timezone": interview.candidate.timezone,
            "current_location": interview.candidate.current_location,
        },
        client={
            "id": interview.client_contact.id,
            "full_name": interview.client_contact.full_name,
            "email": interview.client_contact.email,
            "timezone": interview.client_contact.timezone,
        },
        company={"id": interview.company.id, "name": interview.company.name},
        job={"id": interview.job.id, "title": interview.job.title},
        stage=interview.stage,
        duration_minutes=interview.duration_minutes,
        format=interview.format,
        office_location=interview.office_location,
        proposed_slots=interview.proposed_slots or [],
        scheduled_start_at=_dt(interview.scheduled_start_at),
        scheduled_end_at=_dt(interview.scheduled_end_at),
        availability_windows=[
            AvailabilityWindowOut(
                id=window.id,
                participant_type=participants[window.participant_id].participant_type,
                participant_name=participants[window.participant_id].name,
                date=window.date,
                start_at=_dt(window.start_at) or window.start_at,
                end_at=_dt(window.end_at) or window.end_at,
                timezone=window.timezone,
                original_text=window.original_text,
                interpretation=window.interpretation,
                confidence=window.confidence,
                requires_clarification=window.requires_clarification,
            )
            for window in sorted(interview.availability_windows, key=lambda item: item.start_at)
        ],
        messages=[
            MessageOut(
                id=message.id,
                direction=message.direction,
                channel=message.channel,
                sender_email=message.sender_email,
                recipient_emails=message.recipient_emails or [],
                subject=message.subject,
                body_excerpt=message.body_excerpt,
                body_plain=message.body_plain,
                intent=message.intent,
                intent_confidence=message.intent_confidence,
                status=message.status,
                provider_error=message.provider_error,
                requires_approval=message.requires_approval,
                sent_at=_dt(message.sent_at),
                received_at=_dt(message.received_at),
                created_at=_dt(message.created_at) or datetime.now(timezone.utc),
            )
            for message in sorted(interview.messages, key=lambda item: item.created_at)
        ],
        calendar_events=[
            CalendarEventOut(
                id=event.id,
                provider=event.provider,
                provider_event_id=event.provider_event_id,
                meeting_url=event.meeting_url,
                location=event.location,
                title=event.title,
                description=event.description,
                start_at=_dt(event.start_at) or event.start_at,
                end_at=_dt(event.end_at) or event.end_at,
                timezone=event.timezone,
                status=event.status,
            )
            for event in sorted(interview.calendar_events, key=lambda item: item.created_at)
        ],
        reminders=[
            ReminderOut(
                id=reminder.id,
                reminder_type=reminder.reminder_type,
                scheduled_for=_dt(reminder.scheduled_for) or reminder.scheduled_for,
                channel=reminder.channel,
                status=reminder.status,
            )
            for reminder in sorted(interview.reminders, key=lambda item: item.scheduled_for)
        ],
        workflow_events=[
            WorkflowEventOut(
                id=event.id,
                event_type=event.event_type,
                from_state=event.from_state,
                to_state=event.to_state,
                actor_type=event.actor_type,
                actor_id=event.actor_id,
                metadata_json=event.metadata_json or {},
                created_at=_dt(event.created_at) or datetime.now(timezone.utc),
            )
            for event in sorted(interview.workflow_events, key=lambda item: item.created_at)
        ],
        crm_export=CRMExportOut(
            id=crm_export.id,
            connector_name=crm_export.connector_name,
            summary_text=crm_export.summary_text,
            note_text=crm_export.note_text,
            created_at=_dt(crm_export.created_at) or datetime.now(timezone.utc),
        )
        if crm_export
        else None,
    )


@router.get("", response_model=List[InterviewListItem])
def list_interviews(
    db: Session = Depends(get_db),
    user_email: str = Depends(require_user),
) -> List[InterviewListItem]:
    del user_email
    interviews = (
        db.query(Interview)
        .options(
            joinedload(Interview.candidate),
            joinedload(Interview.client_contact),
            joinedload(Interview.company),
            joinedload(Interview.job),
        )
        .order_by(Interview.updated_at.desc())
        .limit(100)
        .all()
    )
    return [to_list_item(interview) for interview in interviews]


@router.post("", response_model=InterviewDetail, status_code=status.HTTP_201_CREATED)
def create_interview(
    payload: NewInterviewRequest,
    db: Session = Depends(get_db),
    user_email: str = Depends(require_user),
) -> InterviewDetail:
    service = WorkflowService()
    interview = service.create_interview(db, payload, user_email)
    db.commit()
    return to_detail(db, _load_interview(db, interview.id))


@router.post("/process-due", response_model=ProcessDueWorkResponse)
def process_due_work(
    db: Session = Depends(get_db),
    user_email: str = Depends(require_user),
) -> ProcessDueWorkResponse:
    result = WorkflowService().process_due_work(db, user_email)
    db.commit()
    return ProcessDueWorkResponse(**result)


@router.post("/privacy/redact-message-bodies", response_model=RetentionRedactionResponse)
def redact_old_message_bodies(
    payload: RetentionRedactionRequest,
    db: Session = Depends(get_db),
    user_email: str = Depends(require_user),
) -> RetentionRedactionResponse:
    count = WorkflowService().redact_old_message_bodies(db, payload.days, user_email)
    db.commit()
    return RetentionRedactionResponse(redacted_messages=count)


@router.get("/{interview_id}", response_model=InterviewDetail)
def get_interview(
    interview_id: str,
    db: Session = Depends(get_db),
    user_email: str = Depends(require_user),
) -> InterviewDetail:
    del user_email
    return to_detail(db, _load_interview(db, interview_id))


@router.post("/{interview_id}/anonymize", response_model=AnonymizeInterviewResponse)
def anonymize_interview(
    interview_id: str,
    db: Session = Depends(get_db),
    user_email: str = Depends(require_user),
) -> AnonymizeInterviewResponse:
    interview = _load_interview(db, interview_id)
    WorkflowService().anonymize_interview(db, interview, user_email)
    db.commit()
    return AnonymizeInterviewResponse(ok=True, message="Interview personal data has been anonymized.")


@router.post("/{interview_id}/mock-reply", response_model=InterviewDetail)
def mock_reply(
    interview_id: str,
    payload: MockReplyRequest,
    db: Session = Depends(get_db),
    user_email: str = Depends(require_user),
) -> InterviewDetail:
    interview = _load_interview(db, interview_id)
    try:
        WorkflowService().receive_mock_reply(
            db,
            interview,
            payload.participant_type,
            payload.body,
            user_email,
            payload.received_at,
        )
        db.commit()
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return to_detail(db, _load_interview(db, interview_id))


@router.post("/{interview_id}/approve", response_model=InterviewDetail)
def approve_slot(
    interview_id: str,
    payload: ApproveSlotRequest,
    db: Session = Depends(get_db),
    user_email: str = Depends(require_user),
) -> InterviewDetail:
    interview = _load_interview(db, interview_id)
    try:
        WorkflowService().approve_slot(db, interview, payload.slot_index, user_email)
        db.commit()
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return to_detail(db, _load_interview(db, interview_id))


@router.post("/{interview_id}/request-more-availability", response_model=InterviewDetail)
def request_more_availability(
    interview_id: str,
    db: Session = Depends(get_db),
    user_email: str = Depends(require_user),
) -> InterviewDetail:
    interview = _load_interview(db, interview_id)
    try:
        WorkflowService().request_more_availability(db, interview, user_email)
        db.commit()
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return to_detail(db, _load_interview(db, interview_id))


@router.post("/{interview_id}/confirm-cancellation", response_model=InterviewDetail)
def confirm_cancellation(
    interview_id: str,
    payload: CancelInterviewRequest,
    db: Session = Depends(get_db),
    user_email: str = Depends(require_user),
) -> InterviewDetail:
    interview = _load_interview(db, interview_id)
    try:
        WorkflowService().confirm_cancellation(db, interview, user_email, payload.reason)
        db.commit()
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return to_detail(db, _load_interview(db, interview_id))
