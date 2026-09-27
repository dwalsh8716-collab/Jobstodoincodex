from datetime import datetime, time, timedelta, timezone
import uuid
from typing import Callable, Dict, List, Optional
from zoneinfo import ZoneInfo

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.enums import CalendarEventStatus, Intent, InterviewState, MessageStatus, ParticipantType
from app.models import (
    AuditLog,
    AvailabilityWindow,
    CalendarEvent,
    Candidate,
    ClientContact,
    Company,
    CRMExport,
    Interview,
    InterviewParticipant,
    Job,
    Message,
    Reminder,
    User,
    WorkflowOperation,
    WorkflowEvent,
)
from app.schemas import NewInterviewRequest
from app.services.availability_parser import AvailabilityParseResult, RuleBasedAvailabilityParser
from app.services.availability_links import create_availability_link
from app.services.crm import ManualCRMConnector
from app.services.messages import (
    MessageService,
    candidate_availability_body,
    candidate_confirmation_body,
    candidate_cancellation_body,
    candidate_reschedule_confirmation_body,
    chase_availability_body,
    client_availability_body,
    client_cancellation_body,
    client_confirmation_body,
    client_reschedule_confirmation_body,
    clarification_body,
    reminder_body,
    recruiter_reminder_body,
)
from app.services.providers import CalendarEventRequest, CalendarProvider, build_calendar_provider, build_email_provider
from app.services.scheduling import SchedulingWindow, find_top_slots


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _safe_public_id() -> str:
    return "ERINT-" + uuid.uuid4().hex[:8].upper()


def _zone(timezone_name: str) -> ZoneInfo:
    try:
        return ZoneInfo(timezone_name)
    except Exception:
        return ZoneInfo("Europe/London")


def _clean(value: Optional[str], fallback: str = "") -> str:
    if not value:
        return fallback
    return " ".join(value.split())


def _slot_label(value: datetime, timezone_name: str) -> str:
    local = value.astimezone(_zone(timezone_name))
    return local.strftime("%A at %-I:%M%p").replace(":00", "").lower()


class WorkflowService:
    def __init__(
        self,
        settings: Optional[Settings] = None,
        parser: Optional[RuleBasedAvailabilityParser] = None,
        message_service: Optional[MessageService] = None,
        calendar_provider: Optional[CalendarProvider] = None,
        now_provider: Optional[Callable[[], datetime]] = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.parser = parser or RuleBasedAvailabilityParser()
        self.message_service = message_service
        self.calendar_provider = calendar_provider
        self.crm_connector = ManualCRMConnector()
        self.now_provider = now_provider or _now

    def _message_service(self, db: Session) -> MessageService:
        return self.message_service or MessageService(build_email_provider(self.settings, db))

    def _calendar_provider(self, db: Session) -> CalendarProvider:
        return self.calendar_provider or build_calendar_provider(self.settings, db)

    def ensure_user(self, db: Session, email: str) -> User:
        existing = db.query(User).filter(User.email == email).one_or_none()
        if existing:
            return existing
        user = User(email=email, display_name=email.split("@")[0].title(), role="owner")
        db.add(user)
        db.flush()
        return user

    def create_interview(self, db: Session, request: NewInterviewRequest, actor_email: str) -> Interview:
        actor = self.ensure_user(db, actor_email)
        company = Company(name=_clean(request.client.company))
        db.add(company)
        db.flush()

        candidate = Candidate(
            full_name=_clean(request.candidate.full_name),
            email=request.candidate.email.strip().lower(),
            mobile=_clean(request.candidate.mobile) or None,
            timezone=request.candidate.timezone,
            current_location=_clean(request.candidate.current_location) or None,
        )
        db.add(candidate)
        db.flush()

        client = ClientContact(
            company_id=company.id,
            full_name=_clean(request.client.contact_name),
            email=request.client.email.strip().lower(),
            timezone=request.client.timezone,
        )
        db.add(client)
        db.flush()

        job = Job(
            company_id=company.id,
            title=_clean(request.role.job_title),
            company_display_name=_clean(request.role.company),
            notes=_clean(request.notes) or None,
        )
        db.add(job)
        db.flush()

        interview = Interview(
            workflow_public_id=_safe_public_id(),
            candidate_id=candidate.id,
            client_contact_id=client.id,
            company_id=company.id,
            job_id=job.id,
            owner_user_id=actor.id,
            stage=_clean(request.role.interview_stage),
            duration_minutes=request.role.interview_duration,
            format=request.role.interview_format.value,
            office_location=_clean(request.office_location) or None,
            preferred_date_range_start=request.preferred_date_range_start,
            preferred_date_range_end=request.preferred_date_range_end,
            candidate_preparation_notes=_clean(request.candidate_preparation_notes) or None,
            recruiter_instructions=_clean(request.recruiter_instructions) or None,
            notes=_clean(request.notes) or None,
            state=InterviewState.STARTED.value,
            state_reason="Interview coordination started manually by recruiter.",
        )
        db.add(interview)
        db.flush()

        candidate_participant = self._add_participant(
            db,
            interview,
            ParticipantType.CANDIDATE.value,
            candidate.id,
            candidate.full_name,
            candidate.email,
            candidate.timezone,
        )
        client_participant = self._add_participant(
            db,
            interview,
            ParticipantType.CLIENT_CONTACT.value,
            client.id,
            client.full_name,
            client.email,
            client.timezone,
        )
        self._add_participant(
            db,
            interview,
            ParticipantType.RECRUITER.value,
            actor.id,
            actor.display_name,
            actor.email,
            actor.timezone,
            calendar_required=False,
            response_required=False,
        )

        for interviewer in request.additional_interviewers:
            self._add_participant(
                db,
                interview,
                ParticipantType.INTERVIEWER.value,
                None,
                interviewer.name,
                interviewer.email.strip().lower(),
                interviewer.timezone,
                response_required=False,
            )

        self._transition(
            db,
            interview,
            None,
            InterviewState.STARTED,
            "workflow_started",
            "admin",
            actor.email,
            {"source": "manual"},
        )

        if request.candidate_availability_text:
            self._parse_and_store_availability(
                db,
                interview,
                candidate_participant,
                request.candidate_availability_text,
                "manual",
            )

        if request.client_availability_text:
            self._parse_and_store_availability(
                db,
                interview,
                client_participant,
                request.client_availability_text,
                "manual",
            )

        self._advance_after_availability(db, interview, actor.email, initial=True)
        db.flush()
        return interview

    def receive_mock_reply(
        self,
        db: Session,
        interview: Interview,
        participant_type: str,
        body: str,
        actor_email: str,
        received_at: Optional[datetime] = None,
        channel: str = "email",
        provider_message_id: Optional[str] = None,
        provider_thread_id: Optional[str] = None,
    ) -> Interview:
        participant = self._participant_for(db, interview.id, participant_type)
        if not participant:
            raise ValueError(f"No participant found for {participant_type}.")

        reference = received_at or self.now_provider().astimezone(_zone(participant.timezone))
        parsed = self.parser.parse(body, participant.timezone, reference)
        inbound = self._message_service(db).inbound(
            interview=interview,
            sender_email=participant.email or "",
            body=body,
            intent=parsed.intent.value,
            confidence=parsed.confidence,
            received_at=received_at,
            channel=channel,
            provider_message_id=provider_message_id,
            provider_thread_id=provider_thread_id,
        )
        db.add(inbound)
        db.flush()

        if parsed.intent == Intent.RESCHEDULE_REQUEST:
            self._pause_reminders(db, interview)
            self._supersede_interview_availability(db, interview.id)
            interview.proposed_slots = []
            self._transition(
                db,
                interview,
                InterviewState(interview.state),
                InterviewState.RESCHEDULE_REQUESTED,
                "reschedule_requested",
                participant.participant_type,
                participant.email,
                {"message_id": inbound.id},
            )
            return interview

        if parsed.intent == Intent.CANCELLATION_REQUEST:
            self._pause_reminders(db, interview)
            interview.proposed_slots = []
            self._transition(
                db,
                interview,
                InterviewState(interview.state),
                InterviewState.CANCELLATION_REQUESTED,
                "cancellation_requested",
                participant.participant_type,
                participant.email,
                {"message_id": inbound.id},
            )
            return interview

        if parsed.requires_clarification:
            clarification = self._message_service(db).send_outbound(
                interview=interview,
                to=[participant.email or ""],
                subject=f"Interview coordination {interview.workflow_public_id}",
                body=clarification_body(participant.name),
                requires_approval=False,
                auto_send_allowed=True,
            )
            db.add(clarification)
            self._transition(
                db,
                interview,
                InterviewState(interview.state),
                InterviewState.ESCALATED,
                "availability_clarification_needed",
                participant.participant_type,
                participant.email,
                {
                    "message_id": inbound.id,
                    "reason": parsed.clarification_reason,
                },
            )
            return interview

        self._store_parsed_windows(db, interview, participant, parsed, inbound.id, "email")
        self._advance_after_availability(db, interview, actor_email)
        return interview

    def approve_slot(self, db: Session, interview: Interview, slot_index: int, actor_email: str) -> Interview:
        existing_event = self._active_calendar_event(db, interview.id)
        if interview.state == InterviewState.SCHEDULED.value and existing_event:
            return interview
        if interview.state not in {InterviewState.AWAITING_RECRUITER_APPROVAL.value, InterviewState.ERROR.value}:
            raise ValueError("Interview is not awaiting recruiter approval.")

        proposed_slots = interview.proposed_slots or []
        if slot_index >= len(proposed_slots):
            raise ValueError("Selected slot does not exist.")

        selected = proposed_slots[slot_index]
        start_at = datetime.fromisoformat(selected["start_at"])
        end_at = datetime.fromisoformat(selected["end_at"])
        if start_at.tzinfo is None:
            start_at = start_at.replace(tzinfo=timezone.utc)
        if end_at.tzinfo is None:
            end_at = end_at.replace(tzinfo=timezone.utc)
        start_at = start_at.astimezone(timezone.utc)
        end_at = end_at.astimezone(timezone.utc)
        if self._has_required_calendar_conflict(db, interview, start_at, end_at, actor_email):
            raise ValueError("That slot now clashes with a required calendar check. Ask for more availability or choose another time.")

        is_reschedule = existing_event is not None
        operation_name = "reschedule" if is_reschedule else "approve"
        base_operation_key = f"{operation_name}:{interview.id}:{slot_index}:{start_at.isoformat()}:{end_at.isoformat()}"
        operation_key = self._retryable_operation_key(db, base_operation_key)
        operation = WorkflowOperation(
            interview_id=interview.id,
            operation_key=operation_key,
            operation_type="reschedule_interview" if is_reschedule else "approve_slot",
            status="in_progress",
            request_payload={
                "slot_index": slot_index,
                "start_at": start_at.isoformat(),
                "end_at": end_at.isoformat(),
                "existing_event_id": existing_event.id if existing_event else None,
            },
        )
        db.add(operation)
        try:
            db.flush()
        except IntegrityError as exc:
            raise ValueError("This approval is already being processed. Refresh the interview before trying again.") from exc

        interview.approved_slot_start_at = start_at
        interview.approved_slot_end_at = end_at
        interview.approved_slot_timezone = selected.get("timezone") or self.settings.default_timezone

        self._transition(
            db,
            interview,
            InterviewState(interview.state),
            InterviewState.APPROVED,
            "slot_approved",
            "admin",
            actor_email,
            {"slot": selected},
        )

        title = f"{interview.candidate.full_name} - {interview.job.title} - {interview.company.name}"
        attendee_emails = [
            participant.email
            for participant in interview.participants
            if participant.email and participant.participant_type != ParticipantType.RECRUITER.value
        ]
        description = "\n".join(
            [
                "Essential Resourcing interview coordination.",
                f"Stage: {interview.stage}",
                f"Format: {interview.format}",
                f"Recruiter: {actor_email}",
                "",
                "Keep sensitive notes, salary negotiation and private candidate assessment out of this invite.",
            ],
        )
        calendar_provider = self._calendar_provider(db)
        calendar_real = getattr(calendar_provider, "provider", "mock") == "google"
        calendar_request = CalendarEventRequest(
            title=title,
            description=description,
            start_at=start_at,
            end_at=end_at,
            timezone=interview.approved_slot_timezone,
            attendee_emails=attendee_emails,
            format=interview.format,
            location=interview.office_location,
            idempotency_key=operation_key.replace(":", "-"),
        )

        try:
            if existing_event:
                event_result = calendar_provider.update_event(
                    existing_event.provider_event_id or "",
                    calendar_request,
                    existing_event.provider_calendar_id,
                )
                existing_event.provider = getattr(calendar_provider, "provider", "mock")
                existing_event.provider_calendar_id = event_result.provider_calendar_id
                existing_event.provider_event_id = event_result.provider_event_id
                existing_event.meeting_url = event_result.meeting_url
                existing_event.location = event_result.location
                existing_event.title = title
                existing_event.description = description
                existing_event.start_at = start_at
                existing_event.end_at = end_at
                existing_event.timezone = interview.approved_slot_timezone
                existing_event.status = CalendarEventStatus.UPDATED.value
                db.add(existing_event)
                self._cancel_scheduled_reminders(db, interview)
            else:
                event_result = calendar_provider.create_event(calendar_request)
                db.add(
                    CalendarEvent(
                        interview_id=interview.id,
                        provider=getattr(calendar_provider, "provider", "mock"),
                        provider_calendar_id=event_result.provider_calendar_id,
                        provider_event_id=event_result.provider_event_id,
                        meeting_url=event_result.meeting_url,
                        location=event_result.location,
                        title=title,
                        description=description,
                        start_at=start_at,
                        end_at=end_at,
                        timezone=interview.approved_slot_timezone,
                        status=CalendarEventStatus.CREATED.value,
                        created_by_user_id=interview.owner_user_id,
                    ),
                )
        except Exception as exc:
            operation.status = "failed"
            operation.error = str(exc)
            operation.completed_at = self.now_provider()
            db.add(operation)
            self._transition(
                db,
                interview,
                InterviewState.APPROVED,
                InterviewState.ERROR,
                "calendar_operation_failed",
                "system",
                f"{getattr(calendar_provider, 'provider', 'mock')}_calendar_provider",
                {"error": str(exc), "operation_key": operation_key},
            )
            db.flush()
            return interview

        slot_label = _slot_label(start_at, interview.approved_slot_timezone)
        message_service = self._message_service(db)
        candidate_body = (
            candidate_reschedule_confirmation_body(
                interview.candidate.full_name,
                interview.company.name,
                slot_label,
                calendar_real,
                event_result.meeting_url,
            )
            if is_reschedule
            else candidate_confirmation_body(
                interview.candidate.full_name,
                interview.company.name,
                slot_label,
                interview.client_contact.full_name,
                calendar_real,
                event_result.meeting_url,
            )
        )
        client_body = (
            client_reschedule_confirmation_body(
                interview.client_contact.full_name,
                interview.candidate.full_name,
                slot_label,
                calendar_real,
            )
            if is_reschedule
            else client_confirmation_body(
                interview.client_contact.full_name,
                interview.candidate.full_name,
                slot_label,
                calendar_real,
            )
        )
        candidate_message = message_service.send_outbound(
            interview,
            [interview.candidate.email],
            f"{'Interview moved' if is_reschedule else 'Interview confirmed'} - {interview.company.name}",
            candidate_body,
            requires_approval=False,
            auto_send_allowed=True,
        )
        client_message = message_service.send_outbound(
            interview,
            [interview.client_contact.email],
            f"{'Interview moved' if is_reschedule else 'Interview confirmed'} - {interview.candidate.full_name}",
            client_body,
            requires_approval=False,
            auto_send_allowed=True,
        )
        db.add(candidate_message)
        db.add(client_message)

        self._create_reminders(db, interview, start_at)
        interview.scheduled_start_at = start_at
        interview.scheduled_end_at = end_at

        self._transition(
            db,
            interview,
            InterviewState.APPROVED,
            InterviewState.SCHEDULED,
            "interview_rescheduled" if is_reschedule else "interview_scheduled",
            "system",
            f"{getattr(calendar_provider, 'provider', 'mock')}_calendar_provider",
            {"provider_event_id": event_result.provider_event_id},
        )

        summary = self.crm_connector.build_interview_summary(interview)
        note = self.crm_connector.build_note(interview)
        db.add(
            CRMExport(
                interview_id=interview.id,
                connector_name=self.crm_connector.name,
                summary_text=summary,
                note_text=note,
            ),
        )
        operation.status = "completed"
        operation.provider = getattr(calendar_provider, "provider", "mock")
        operation.provider_reference = event_result.provider_event_id
        operation.completed_at = self.now_provider()
        db.add(operation)
        db.flush()
        return interview

    def request_more_availability(self, db: Session, interview: Interview, actor_email: str) -> Interview:
        if interview.state in {InterviewState.CANCELLED.value, InterviewState.COMPLETED.value}:
            raise ValueError("This interview is already closed.")

        self._pause_reminders(db, interview)
        self._supersede_interview_availability(db, interview.id)
        interview.proposed_slots = []

        candidate_participant = self._participant_for(db, interview.id, "candidate")
        client_participant = self._participant_for(db, interview.id, "client")
        message_service = self._message_service(db)

        if client_participant:
            client_link = create_availability_link(db, self.settings, interview, client_participant)
            db.add(
                message_service.send_outbound(
                    interview,
                    [interview.client_contact.email],
                    f"Interview availability - {interview.candidate.full_name}",
                    client_availability_body(
                        interview.client_contact.full_name,
                        interview.candidate.full_name,
                        client_link,
                    ),
                    requires_approval=False,
                    auto_send_allowed=True,
                ),
            )

        if candidate_participant:
            candidate_link = create_availability_link(db, self.settings, interview, candidate_participant)
            db.add(
                message_service.send_outbound(
                    interview,
                    [interview.candidate.email],
                    f"Interview availability - {interview.company.name}",
                    candidate_availability_body(interview.candidate.full_name, None, candidate_link),
                    requires_approval=False,
                    auto_send_allowed=True,
                ),
            )

        self._transition(
            db,
            interview,
            InterviewState(interview.state),
            InterviewState.AWAITING_BOTH,
            "more_availability_requested",
            "admin",
            actor_email,
            {},
        )
        db.flush()
        return interview

    def confirm_cancellation(
        self,
        db: Session,
        interview: Interview,
        actor_email: str,
        reason: Optional[str] = None,
    ) -> Interview:
        if interview.state == InterviewState.CANCELLED.value:
            return interview

        allowed_states = {
            InterviewState.AWAITING_RECRUITER_APPROVAL.value,
            InterviewState.SCHEDULED.value,
            InterviewState.RESCHEDULE_REQUESTED.value,
            InterviewState.CANCELLATION_REQUESTED.value,
            InterviewState.ESCALATED.value,
            InterviewState.ERROR.value,
        }
        if interview.state not in allowed_states:
            raise ValueError("This interview is not ready to cancel.")

        existing_event = self._active_calendar_event(db, interview.id)
        base_operation_key = f"cancel:{interview.id}:{existing_event.provider_event_id if existing_event else 'no-event'}"
        operation_key = self._retryable_operation_key(db, base_operation_key)
        operation = WorkflowOperation(
            interview_id=interview.id,
            operation_key=operation_key,
            operation_type="cancel_interview",
            status="in_progress",
            request_payload={"reason": reason, "existing_event_id": existing_event.id if existing_event else None},
        )
        db.add(operation)
        try:
            db.flush()
        except IntegrityError as exc:
            raise ValueError("This cancellation is already being processed. Refresh the interview before trying again.") from exc

        calendar_removed = False
        if existing_event and existing_event.provider_event_id:
            calendar_provider = self._calendar_provider(db)
            try:
                calendar_provider.cancel_event(existing_event.provider_event_id, existing_event.provider_calendar_id)
            except Exception as exc:
                operation.status = "failed"
                operation.error = str(exc)
                operation.completed_at = self.now_provider()
                db.add(operation)
                self._transition(
                    db,
                    interview,
                    InterviewState(interview.state),
                    InterviewState.ERROR,
                    "calendar_cancellation_failed",
                    "system",
                    f"{getattr(calendar_provider, 'provider', 'mock')}_calendar_provider",
                    {"error": str(exc), "operation_key": operation_key},
                )
                db.flush()
                return interview
            existing_event.status = CalendarEventStatus.CANCELLED.value
            existing_event.cancelled_at = self.now_provider()
            db.add(existing_event)
            calendar_removed = getattr(calendar_provider, "provider", "mock") == "google"

        self._cancel_scheduled_reminders(db, interview)
        interview.cancelled_at = self.now_provider()
        interview.proposed_slots = []

        if existing_event or interview.scheduled_start_at:
            message_service = self._message_service(db)
            db.add(
                message_service.send_outbound(
                    interview,
                    [interview.candidate.email],
                    f"Interview cancelled - {interview.company.name}",
                    candidate_cancellation_body(interview.candidate.full_name, interview.company.name, calendar_removed),
                    requires_approval=False,
                    auto_send_allowed=True,
                ),
            )
            db.add(
                message_service.send_outbound(
                    interview,
                    [interview.client_contact.email],
                    f"Interview cancelled - {interview.candidate.full_name}",
                    client_cancellation_body(interview.client_contact.full_name, interview.candidate.full_name, calendar_removed),
                    requires_approval=False,
                    auto_send_allowed=True,
                ),
            )

        self._transition(
            db,
            interview,
            InterviewState(interview.state),
            InterviewState.CANCELLED,
            "interview_cancelled",
            "admin",
            actor_email,
            {"reason": reason, "calendar_removed": calendar_removed},
        )
        operation.status = "completed"
        operation.provider = existing_event.provider if existing_event else "none"
        operation.provider_reference = existing_event.provider_event_id if existing_event else None
        operation.completed_at = self.now_provider()
        db.add(operation)
        db.flush()
        return interview

    def process_due_work(self, db: Session, actor_email: str) -> Dict[str, object]:
        now = self.now_provider()
        reminders_sent = 0
        chases_sent = 0
        failures: List[str] = []
        message_service = self._message_service(db)

        due_reminders = (
            db.query(Reminder)
            .filter(Reminder.status == "scheduled", Reminder.scheduled_for <= now)
            .order_by(Reminder.scheduled_for)
            .limit(100)
            .all()
        )
        for reminder in due_reminders:
            interview = db.query(Interview).filter(Interview.id == reminder.interview_id).one_or_none()
            participant = (
                db.query(InterviewParticipant)
                .filter(InterviewParticipant.id == reminder.participant_id)
                .one_or_none()
                if reminder.participant_id
                else None
            )
            if not interview or not participant or not participant.email:
                reminder.status = "failed"
                reminder.failed_at = now
                failures.append(f"Reminder {reminder.id} has no valid interview participant.")
                continue
            slot_label = _slot_label(interview.scheduled_start_at or reminder.scheduled_for, participant.timezone)
            if participant.participant_type == ParticipantType.RECRUITER.value:
                body = recruiter_reminder_body(interview.candidate.full_name, interview.company.name, interview.job.title, slot_label)
                subject = f"Interview today - {interview.candidate.full_name}"
            else:
                body = reminder_body(participant.name, interview.company.name, slot_label)
                subject = f"Interview reminder - {interview.company.name}"

            message = message_service.send_outbound(
                interview,
                [participant.email],
                subject,
                body,
                requires_approval=False,
                auto_send_allowed=True,
            )
            db.add(message)
            reminder.provider_message_id = message.provider_message_id
            if message.status == MessageStatus.FAILED.value:
                reminder.status = "failed"
                reminder.failed_at = now
                failures.append(message.provider_error or f"Reminder {reminder.id} failed to send.")
            else:
                reminder.status = "sent"
                reminder.sent_at = now
                reminders_sent += 1

        for interview in (
            db.query(Interview)
            .filter(
                Interview.state.in_(
                    [
                        InterviewState.AWAITING_BOTH.value,
                        InterviewState.AWAITING_CLIENT_AVAILABILITY.value,
                        InterviewState.AWAITING_CANDIDATE_AVAILABILITY.value,
                    ],
                ),
            )
            .limit(200)
            .all()
        ):
            for participant_type, recipient_email, recipient_name in [
                (ParticipantType.CANDIDATE.value, interview.candidate.email, interview.candidate.full_name),
                (ParticipantType.CLIENT_CONTACT.value, interview.client_contact.email, interview.client_contact.full_name),
            ]:
                if self._has_availability(db, interview.id, participant_type):
                    continue
                chase_result = self._send_chase_if_due(db, interview, recipient_email, recipient_name, message_service, now, actor_email)
                if chase_result == "sent":
                    chases_sent += 1
                elif chase_result and chase_result != "not_due":
                    failures.append(chase_result)

        db.flush()
        return {"reminders_sent": reminders_sent, "chases_sent": chases_sent, "failures": failures}

    def anonymize_interview(self, db: Session, interview: Interview, actor_email: str) -> None:
        redacted_candidate_email = f"redacted-candidate-{interview.candidate.id[:8]}@example.invalid"
        redacted_client_email = f"redacted-client-{interview.client_contact.id[:8]}@example.invalid"

        interview.candidate.full_name = "Redacted candidate"
        interview.candidate.email = redacted_candidate_email
        interview.candidate.mobile = None
        interview.candidate.current_location = None
        interview.candidate.deleted_at = self.now_provider()

        interview.client_contact.full_name = "Redacted client"
        interview.client_contact.email = redacted_client_email
        interview.client_contact.phone = None
        interview.notes = None
        interview.candidate_preparation_notes = None
        interview.recruiter_instructions = None
        interview.job.notes = None

        for participant in interview.participants:
            if participant.participant_type == ParticipantType.CANDIDATE.value:
                participant.name = "Redacted candidate"
                participant.email = redacted_candidate_email
            elif participant.participant_type in {ParticipantType.CLIENT_CONTACT.value, ParticipantType.INTERVIEWER.value}:
                participant.name = "Redacted client contact"
                participant.email = f"redacted-participant-{participant.id[:8]}@example.invalid"

        for window in interview.availability_windows:
            window.original_text = "[redacted]"
            window.interpretation = "[redacted]"

        for message in interview.messages:
            message.sender_email = None
            message.recipient_emails = []
            message.body_plain = None
            message.body_excerpt = "[redacted]"
            message.provider_error = None

        db.add(
            AuditLog(
                actor_type="admin",
                actor_id=actor_email,
                action="interview_anonymized",
                entity_type="interview",
                entity_id=interview.id,
                summary="Personal data was anonymized for this interview workflow.",
                metadata_json={"workflow_public_id": interview.workflow_public_id},
            ),
        )
        db.flush()

    def redact_old_message_bodies(self, db: Session, days: int, actor_email: str) -> int:
        cutoff = self.now_provider() - timedelta(days=days)
        messages = (
            db.query(Message)
            .filter(Message.created_at < cutoff, Message.body_plain.is_not(None))
            .limit(1000)
            .all()
        )
        for message in messages:
            message.body_plain = None
            message.body_excerpt = "[retained metadata only]"
            message.provider_error = None
        if messages:
            db.add(
                AuditLog(
                    actor_type="admin",
                    actor_id=actor_email,
                    action="message_bodies_redacted",
                    entity_type="message",
                    entity_id="bulk",
                    summary=f"Redacted {len(messages)} message bodies older than {days} days.",
                    metadata_json={"days": days, "count": len(messages)},
                ),
            )
        db.flush()
        return len(messages)

    def _send_chase_if_due(
        self,
        db: Session,
        interview: Interview,
        recipient_email: str,
        recipient_name: str,
        message_service: MessageService,
        now: datetime,
        actor_email: str,
    ) -> Optional[str]:
        recipient = recipient_email.strip().lower()
        outbound_messages = (
            db.query(Message)
            .filter(
                Message.interview_id == interview.id,
                Message.direction == "outbound",
            )
            .order_by(Message.created_at.desc())
            .all()
        )
        chases = [
            message
            for message in outbound_messages
            if (message.subject or "").startswith("Interview availability nudge")
            and recipient in [email.lower() for email in (message.recipient_emails or [])]
        ]
        if len(chases) >= self.settings.max_automated_chases:
            return None

        availability_requests = [
            message
            for message in outbound_messages
            if (message.subject or "").startswith("Interview availability")
            and recipient in [email.lower() for email in (message.recipient_emails or [])]
        ]
        last_request = availability_requests[0] if availability_requests else None
        if not last_request or not last_request.created_at:
            return None

        request_time = last_request.created_at
        if request_time.tzinfo is None:
            request_time = request_time.replace(tzinfo=timezone.utc)
        if now - request_time.astimezone(timezone.utc) < timedelta(hours=24):
            return "not_due"

        has_reply_after_request = (
            db.query(Message)
            .filter(
                Message.interview_id == interview.id,
                Message.direction == "inbound",
                Message.sender_email == recipient,
                Message.created_at > last_request.created_at,
            )
            .count()
            > 0
        )
        if has_reply_after_request:
            return None

        message = message_service.send_outbound(
            interview,
            [recipient],
            f"Interview availability nudge - {interview.company.name}",
            chase_availability_body(recipient_name),
            requires_approval=False,
            auto_send_allowed=True,
        )
        db.add(message)
        if message.status == MessageStatus.FAILED.value:
            return message.provider_error or f"Chase to {recipient} failed."

        self._transition(
            db,
            interview,
            InterviewState(interview.state),
            InterviewState(interview.state),
            "availability_chase_sent",
            "system",
            actor_email,
            {"recipient": recipient, "chase_number": len(chases) + 1},
        )
        return "sent"

    def _active_calendar_event(self, db: Session, interview_id: str) -> Optional[CalendarEvent]:
        return (
            db.query(CalendarEvent)
            .filter(
                CalendarEvent.interview_id == interview_id,
                CalendarEvent.status.in_([CalendarEventStatus.CREATED.value, CalendarEventStatus.UPDATED.value]),
            )
            .order_by(CalendarEvent.created_at.desc())
            .first()
        )

    def _retryable_operation_key(self, db: Session, base_key: str) -> str:
        existing = db.query(WorkflowOperation).filter(WorkflowOperation.operation_key == base_key).one_or_none()
        if not existing or existing.status != "failed":
            return base_key
        retry_count = (
            db.query(WorkflowOperation)
            .filter(WorkflowOperation.operation_key.like(f"{base_key}:retry:%"))
            .count()
        )
        return f"{base_key}:retry:{retry_count + 1}"

    def _required_participant_emails(self, interview: Interview) -> set[str]:
        return {
            participant.email.strip().lower()
            for participant in interview.participants
            if participant.email and participant.participant_type != ParticipantType.RECRUITER.value
        }

    def _local_required_attendee_busy_windows(
        self,
        db: Session,
        interview: Interview,
        time_min: datetime,
        time_max: datetime,
    ) -> List[SchedulingWindow]:
        required_emails = self._required_participant_emails(interview)
        if not required_emails:
            return []

        rows = (
            db.query(CalendarEvent)
            .filter(
                CalendarEvent.interview_id != interview.id,
                CalendarEvent.status.in_([CalendarEventStatus.CREATED.value, CalendarEventStatus.UPDATED.value]),
                CalendarEvent.start_at < time_max,
                CalendarEvent.end_at > time_min,
            )
            .all()
        )
        busy: List[SchedulingWindow] = []
        for row in rows:
            participant_emails = {
                participant.email.strip().lower()
                for participant in db.query(InterviewParticipant)
                .filter(
                    InterviewParticipant.interview_id == row.interview_id,
                    InterviewParticipant.participant_type != ParticipantType.RECRUITER.value,
                    InterviewParticipant.email.is_not(None),
                )
                .all()
                if participant.email
            }
            if required_emails.intersection(participant_emails):
                busy.append(
                    SchedulingWindow(
                        start_at=row.start_at,
                        end_at=row.end_at,
                        timezone=row.timezone,
                        participant_type="known_interview_attendee",
                        confidence=1.0,
                        source_id=row.id,
                    ),
                )
        return busy

    def _optional_recruiter_busy_windows(self, db: Session, time_min: datetime, time_max: datetime) -> List[SchedulingWindow]:
        if not self.settings.check_recruiter_calendar_conflicts:
            return []

        return [
            SchedulingWindow(
                start_at=window.start_at,
                end_at=window.end_at,
                timezone=window.timezone,
                participant_type=ParticipantType.RECRUITER.value,
                confidence=1.0,
                source_id=window.source_id,
            )
            for window in self._calendar_provider(db).busy_windows(time_min, time_max)
        ]

    def _required_busy_windows_for_matching(
        self,
        db: Session,
        interview: Interview,
        candidate_windows: List[SchedulingWindow],
        client_windows: List[SchedulingWindow],
    ) -> List[SchedulingWindow]:
        windows = [*candidate_windows, *client_windows]
        if not windows:
            return []
        time_min = min(window.start_at for window in windows).astimezone(timezone.utc)
        time_max = max(window.end_at for window in windows).astimezone(timezone.utc)
        return [
            *self._local_required_attendee_busy_windows(db, interview, time_min, time_max),
            *self._optional_recruiter_busy_windows(db, time_min, time_max),
        ]

    def _has_required_calendar_conflict(
        self,
        db: Session,
        interview: Interview,
        start_at: datetime,
        end_at: datetime,
        actor_email: str,
    ) -> bool:
        del actor_email
        busy_windows = [
            *self._local_required_attendee_busy_windows(db, interview, start_at, end_at),
            *self._optional_recruiter_busy_windows(db, start_at, end_at),
        ]
        return any(start_at < busy.end_at.astimezone(timezone.utc) and end_at > busy.start_at.astimezone(timezone.utc) for busy in busy_windows)

    def _add_participant(
        self,
        db: Session,
        interview: Interview,
        participant_type: str,
        person_id: Optional[str],
        name: str,
        email: str,
        timezone_name: str,
        calendar_required: bool = True,
        response_required: bool = True,
    ) -> InterviewParticipant:
        participant = InterviewParticipant(
            interview_id=interview.id,
            participant_type=participant_type,
            person_id=person_id,
            name=name,
            email=email,
            timezone=timezone_name,
            calendar_required=calendar_required,
            response_required=response_required,
        )
        db.add(participant)
        db.flush()
        return participant

    def _parse_and_store_availability(
        self,
        db: Session,
        interview: Interview,
        participant: InterviewParticipant,
        text: str,
        source: str,
    ) -> None:
        reference = self.now_provider().astimezone(_zone(participant.timezone))
        parsed = self.parser.parse(text, participant.timezone, reference)
        if parsed.requires_clarification:
            self._transition(
                db,
                interview,
                InterviewState(interview.state),
                InterviewState.ESCALATED,
                "availability_parse_failed",
                "system",
                participant.email,
                {"reason": parsed.clarification_reason, "participant_type": participant.participant_type},
            )
            return
        self._store_parsed_windows(db, interview, participant, parsed, None, source)

    def submit_structured_availability(
        self,
        db: Session,
        interview: Interview,
        participant: InterviewParticipant,
        windows: List[dict],
        notes: Optional[str],
    ) -> Interview:
        body = self._availability_link_body(participant.name, windows, notes)
        inbound = Message(
            interview_id=interview.id,
            direction="inbound",
            channel="availability_link",
            sender_email=participant.email,
            recipient_emails=[],
            subject=f"Availability submitted - {interview.workflow_public_id}",
            body_plain=body,
            body_excerpt=body[:240],
            workflow_public_id=interview.workflow_public_id,
            intent=Intent.AVAILABILITY_RESPONSE.value,
            intent_confidence=1.0,
            status=MessageStatus.RECEIVED.value,
            received_at=self.now_provider(),
        )
        db.add(inbound)
        db.flush()

        self._supersede_participant_availability(db, interview.id, participant.id)

        for window in windows:
            start_at = self._combine_public_window(window["date"], window["start"], window["timezone"])
            end_at = self._combine_public_window(window["date"], window["end"], window["timezone"])
            if end_at <= start_at:
                raise ValueError("Availability end time must be after the start time.")
            db.add(
                AvailabilityWindow(
                    interview_id=interview.id,
                    participant_id=participant.id,
                    source_message_id=inbound.id,
                    source="availability_link",
                    date=window["date"],
                    start_at=start_at.astimezone(timezone.utc),
                    end_at=end_at.astimezone(timezone.utc),
                    timezone=window["timezone"],
                    original_text=notes or "Availability selected through the private availability link.",
                    interpretation=(
                        f"{participant.name} selected "
                        f"{start_at.strftime('%A %H:%M')}-{end_at.strftime('%H:%M')} {start_at.tzname()}."
                    ),
                    confidence=1.0,
                    requires_clarification=False,
                ),
            )

        db.flush()
        self._advance_after_availability(db, interview, "availability_link")
        return interview

    def _store_parsed_windows(
        self,
        db: Session,
        interview: Interview,
        participant: InterviewParticipant,
        parsed: AvailabilityParseResult,
        message_id: Optional[str],
        source: str,
    ) -> None:
        if parsed.confidence < self.settings.ai_confidence_threshold or any(
            window.confidence < self.settings.ai_confidence_threshold for window in parsed.availability
        ):
            self._transition(
                db,
                interview,
                InterviewState(interview.state),
                InterviewState.ESCALATED,
                "availability_confidence_below_threshold",
                "system",
                participant.email,
                {
                    "participant_type": participant.participant_type,
                    "confidence": parsed.confidence,
                    "threshold": self.settings.ai_confidence_threshold,
                },
            )
            return
        if parsed.availability:
            self._supersede_participant_availability(db, interview.id, participant.id)
            interview.proposed_slots = []
        for window in parsed.availability:
            db.add(
                AvailabilityWindow(
                    interview_id=interview.id,
                    participant_id=participant.id,
                    source_message_id=message_id,
                    source=source,
                    date=window.date,
                    start_at=window.start_at.astimezone(timezone.utc),
                    end_at=window.end_at.astimezone(timezone.utc),
                    timezone=window.timezone,
                    original_text=window.original_text,
                    interpretation=window.interpretation,
                    confidence=window.confidence,
                    requires_clarification=window.requires_clarification,
                ),
            )
        db.flush()

    def _supersede_participant_availability(self, db: Session, interview_id: str, participant_id: str) -> None:
        (
            db.query(AvailabilityWindow)
            .filter(
                AvailabilityWindow.interview_id == interview_id,
                AvailabilityWindow.participant_id == participant_id,
                AvailabilityWindow.requires_clarification.is_(False),
                AvailabilityWindow.superseded_at.is_(None),
            )
            .update({AvailabilityWindow.superseded_at: self.now_provider()}, synchronize_session=False)
        )

    def _supersede_interview_availability(self, db: Session, interview_id: str) -> None:
        (
            db.query(AvailabilityWindow)
            .filter(
                AvailabilityWindow.interview_id == interview_id,
                AvailabilityWindow.requires_clarification.is_(False),
                AvailabilityWindow.superseded_at.is_(None),
            )
            .update({AvailabilityWindow.superseded_at: self.now_provider()}, synchronize_session=False)
        )

    def _advance_after_availability(
        self,
        db: Session,
        interview: Interview,
        actor_email: str,
        initial: bool = False,
    ) -> None:
        has_candidate = self._has_availability(db, interview.id, ParticipantType.CANDIDATE.value)
        has_client = self._has_availability(db, interview.id, ParticipantType.CLIENT_CONTACT.value)

        if has_candidate and has_client:
            self._match_and_create_approval(db, interview, actor_email)
            return

        if not has_client:
            client_participant = self._participant_for(db, interview.id, "client")
            if client_participant and not self._availability_request_already_sent(db, interview.id, interview.client_contact.email):
                client_link = create_availability_link(db, self.settings, interview, client_participant)
                client_body = client_availability_body(
                    interview.client_contact.full_name,
                    interview.candidate.full_name,
                    client_link,
                )
                db.add(
                    self._message_service(db).send_outbound(
                        interview,
                        [interview.client_contact.email],
                        f"Interview availability - {interview.candidate.full_name}",
                        client_body,
                        requires_approval=False,
                        auto_send_allowed=True,
                    ),
                )

        if not has_candidate:
            known_client_text = None
            if has_client:
                known_client_text = self._availability_summary(db, interview.id, ParticipantType.CLIENT_CONTACT.value)
            candidate_participant = self._participant_for(db, interview.id, "candidate")
            if candidate_participant and not self._availability_request_already_sent(db, interview.id, interview.candidate.email):
                candidate_link = create_availability_link(db, self.settings, interview, candidate_participant)
                db.add(
                    self._message_service(db).send_outbound(
                        interview,
                        [interview.candidate.email],
                        f"Interview availability - {interview.company.name}",
                        candidate_availability_body(interview.candidate.full_name, known_client_text, candidate_link),
                        requires_approval=False,
                        auto_send_allowed=True,
                    ),
                )

        next_state = InterviewState.AWAITING_BOTH
        if has_candidate and not has_client:
            next_state = InterviewState.AWAITING_CLIENT_AVAILABILITY
        elif has_client and not has_candidate:
            next_state = InterviewState.AWAITING_CANDIDATE_AVAILABILITY

        current = InterviewState(interview.state)
        self._transition(
            db,
            interview,
            current,
            next_state,
            "waiting_for_availability" if initial else "availability_updated",
            "system",
            actor_email,
            {"has_candidate_availability": has_candidate, "has_client_availability": has_client},
        )

    def _match_and_create_approval(self, db: Session, interview: Interview, actor_email: str) -> None:
        candidate_windows = self._scheduling_windows(db, interview.id, ParticipantType.CANDIDATE.value)
        client_windows = self._scheduling_windows(db, interview.id, ParticipantType.CLIENT_CONTACT.value)
        try:
            required_busy = self._required_busy_windows_for_matching(db, interview, candidate_windows, client_windows)
        except ValueError as exc:
            self._transition(
                db,
                interview,
                InterviewState(interview.state),
                InterviewState.ERROR,
                "calendar_conflict_check_failed",
                "system",
                actor_email,
                {"error": str(exc)},
            )
            return
        slots = find_top_slots(
            candidate_windows,
            client_windows,
            interview.duration_minutes,
            display_timezone=self.settings.default_timezone,
            schedule_start=self.settings.default_interview_start,
            schedule_end=self.settings.default_interview_end,
            recruiter_busy=required_busy,
            limit=3,
            earliest_start=self.now_provider(),
        )

        if not slots:
            self._transition(
                db,
                interview,
                InterviewState(interview.state),
                InterviewState.ESCALATED,
                "no_overlap_found",
                "system",
                actor_email,
                {},
            )
            return

        self._transition(
            db,
            interview,
            InterviewState(interview.state),
            InterviewState.MATCHING_AVAILABILITY,
            "matching_availability",
            "system",
            actor_email,
            {},
        )
        interview.proposed_slots = [slot.as_dict() for slot in slots]
        self._transition(
            db,
            interview,
            InterviewState.MATCHING_AVAILABILITY,
            InterviewState.AWAITING_RECRUITER_APPROVAL,
            "approval_card_created",
            "system",
            actor_email,
            {"slot_count": len(slots)},
        )

    def _has_availability(self, db: Session, interview_id: str, participant_type: str) -> bool:
        return (
            db.query(AvailabilityWindow)
            .join(InterviewParticipant, AvailabilityWindow.participant_id == InterviewParticipant.id)
            .filter(
                AvailabilityWindow.interview_id == interview_id,
                InterviewParticipant.participant_type == participant_type,
                AvailabilityWindow.requires_clarification.is_(False),
                AvailabilityWindow.superseded_at.is_(None),
            )
            .count()
            > 0
        )

    def _participant_for(self, db: Session, interview_id: str, participant_type: str) -> Optional[InterviewParticipant]:
        mapped = (
            ParticipantType.CANDIDATE.value
            if participant_type in {"candidate", ParticipantType.CANDIDATE.value}
            else ParticipantType.CLIENT_CONTACT.value
        )
        return (
            db.query(InterviewParticipant)
            .filter(
                InterviewParticipant.interview_id == interview_id,
                InterviewParticipant.participant_type == mapped,
            )
            .first()
        )

    def _scheduling_windows(self, db: Session, interview_id: str, participant_type: str) -> List[SchedulingWindow]:
        rows = (
            db.query(AvailabilityWindow)
            .join(InterviewParticipant, AvailabilityWindow.participant_id == InterviewParticipant.id)
            .filter(
                AvailabilityWindow.interview_id == interview_id,
                InterviewParticipant.participant_type == participant_type,
                AvailabilityWindow.requires_clarification.is_(False),
                AvailabilityWindow.superseded_at.is_(None),
            )
            .all()
        )
        return [
            SchedulingWindow(
                start_at=row.start_at,
                end_at=row.end_at,
                timezone=row.timezone,
                participant_type=participant_type,
                confidence=row.confidence,
                source_id=row.id,
            )
            for row in rows
        ]

    def _availability_summary(self, db: Session, interview_id: str, participant_type: str) -> str:
        rows = (
            db.query(AvailabilityWindow)
            .join(InterviewParticipant, AvailabilityWindow.participant_id == InterviewParticipant.id)
            .filter(
                AvailabilityWindow.interview_id == interview_id,
                InterviewParticipant.participant_type == participant_type,
                AvailabilityWindow.superseded_at.is_(None),
            )
            .order_by(AvailabilityWindow.start_at)
            .all()
        )
        labels = []
        for row in rows:
            start = row.start_at.astimezone(_zone(row.timezone))
            end = row.end_at.astimezone(_zone(row.timezone))
            labels.append(f"{start.strftime('%A')} {start.strftime('%H:%M')}-{end.strftime('%H:%M')} {start.tzname()}")
        return "\n".join(labels)

    def _availability_request_already_sent(self, db: Session, interview_id: str, recipient_email: str) -> bool:
        messages = (
            db.query(Message)
            .filter(
                Message.interview_id == interview_id,
                Message.direction == "outbound",
                Message.subject.like("Interview availability%"),
            )
            .all()
        )
        email = recipient_email.strip().lower()
        return any(email in [recipient.lower() for recipient in (message.recipient_emails or [])] for message in messages)

    def _combine_public_window(self, day, clock_value: str, timezone_name: str) -> datetime:
        hour, minute = [int(part) for part in clock_value.split(":")]
        return datetime.combine(day, time(hour, minute), tzinfo=_zone(timezone_name))

    def _availability_link_body(self, participant_name: str, windows: List[dict], notes: Optional[str]) -> str:
        lines = [f"{participant_name} submitted availability via the private link.", ""]
        for window in windows:
            lines.append(f"{window['date'].isoformat()} {window['start']}-{window['end']} {window['timezone']}")
        if notes:
            lines.extend(["", f"Notes: {notes}"])
        return "\n".join(lines)

    def _create_reminders(self, db: Session, interview: Interview, start_at: datetime) -> None:
        candidate_participant = self._participant_for(db, interview.id, "candidate")
        recruiter = (
            db.query(InterviewParticipant)
            .filter(
                InterviewParticipant.interview_id == interview.id,
                InterviewParticipant.participant_type == ParticipantType.RECRUITER.value,
            )
            .first()
        )

        if candidate_participant:
            db.add(
                Reminder(
                    interview_id=interview.id,
                    participant_id=candidate_participant.id,
                    reminder_type="candidate_24h",
                    scheduled_for=start_at - timedelta(hours=24),
                    channel="email",
                    status="scheduled",
                ),
            )

        if recruiter:
            local = start_at.astimezone(_zone(recruiter.timezone))
            morning = datetime.combine(local.date(), time(8, 0), tzinfo=_zone(recruiter.timezone)).astimezone(timezone.utc)
            db.add(
                Reminder(
                    interview_id=interview.id,
                    participant_id=recruiter.id,
                    reminder_type="recruiter_morning_of",
                    scheduled_for=morning,
                    channel="email",
                    status="scheduled",
                ),
            )

    def _pause_reminders(self, db: Session, interview: Interview) -> None:
        for reminder in interview.reminders:
            if reminder.status == "scheduled":
                reminder.status = "paused"
                reminder.paused_at = self.now_provider()

    def _cancel_scheduled_reminders(self, db: Session, interview: Interview) -> None:
        for reminder in interview.reminders:
            if reminder.status in {"scheduled", "paused"}:
                reminder.status = "cancelled"
                reminder.paused_at = reminder.paused_at or self.now_provider()

    def _transition(
        self,
        db: Session,
        interview: Interview,
        from_state: Optional[InterviewState],
        to_state: InterviewState,
        event_type: str,
        actor_type: str,
        actor_id: Optional[str],
        metadata: Dict,
    ) -> None:
        previous = from_state.value if from_state else None
        interview.state = to_state.value
        interview.state_reason = event_type.replace("_", " ")
        db.add(
            WorkflowEvent(
                interview_id=interview.id,
                event_type=event_type,
                from_state=previous,
                to_state=to_state.value,
                actor_type=actor_type,
                actor_id=actor_id,
                metadata_json=metadata,
            ),
        )
        db.add(
            AuditLog(
                actor_type=actor_type,
                actor_id=actor_id,
                action=event_type,
                entity_type="interview",
                entity_id=interview.id,
                summary=f"Interview workflow moved from {previous or 'new'} to {to_state.value}.",
                metadata_json=metadata,
            ),
        )
        db.flush()
