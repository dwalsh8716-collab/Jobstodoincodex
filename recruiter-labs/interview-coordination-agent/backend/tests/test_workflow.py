from datetime import datetime, timezone
from dataclasses import replace

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app import models  # noqa: F401
from app.database import Base
from app.config import get_settings
from app.enums import CalendarEventStatus, InterviewFormat, InterviewState, MessageStatus, ParticipantType
from app.models import AvailabilityLink, AvailabilityWindow, CalendarEvent, Message, Reminder
from app.schemas import CandidateInput, ClientInput, NewInterviewRequest, RoleInput
from app.services.providers import CalendarBusyWindow, CalendarEventRequest, CalendarEventResult, MockCalendarProvider
from app.services.workflow import WorkflowService


def _session():
    engine = create_engine("sqlite:///:memory:", future=True)
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)()


def _payload(candidate_availability=None, client_availability=None):
    return NewInterviewRequest(
        candidate=CandidateInput(
            full_name="Sarah Jones",
            email="sarah@example.com",
            timezone="Europe/London",
        ),
        client=ClientInput(
            contact_name="Greg Smith",
            email="greg@example.com",
            company="WPP",
            timezone="Europe/London",
        ),
        role=RoleInput(
            job_title="PPC Account Director",
            company="WPP",
            interview_stage="First Interview",
            interview_duration=45,
            interview_format=InterviewFormat.GOOGLE_MEET,
        ),
        candidate_availability_text=candidate_availability,
        client_availability_text=client_availability,
    )


def _service() -> WorkflowService:
    return WorkflowService(now_provider=lambda: datetime(2026, 8, 17, 9, 0, tzinfo=timezone.utc))


class FailingCalendarProvider(MockCalendarProvider):
    provider = "failing"

    def create_event(self, request: CalendarEventRequest) -> CalendarEventResult:
        del request
        raise ValueError("calendar unavailable")

    def cancel_event(self, provider_event_id: str, provider_calendar_id=None) -> None:
        del provider_event_id, provider_calendar_id
        raise ValueError("calendar unavailable")


def test_new_workflow_requests_missing_availability_without_booking() -> None:
    db = _session()
    service = _service()

    interview = service.create_interview(db, _payload(), "david@example.com")

    assert interview.state == InterviewState.AWAITING_BOTH.value
    assert db.query(Message).filter(Message.direction == "outbound").count() == 2
    assert db.query(Message).filter(Message.status == MessageStatus.MOCK_SENT.value).count() == 2
    assert db.query(AvailabilityLink).count() == 2
    assert db.query(CalendarEvent).count() == 0


def test_known_availability_creates_approval_card_not_calendar_event() -> None:
    db = _session()
    service = _service()

    interview = service.create_interview(
        db,
        _payload(
            candidate_availability="Tuesday works any time after 3. Wednesday morning works too.",
            client_availability="Tuesday after 2 or Wednesday morning.",
        ),
        "david@example.com",
    )

    assert interview.state == InterviewState.AWAITING_RECRUITER_APPROVAL.value
    assert len(interview.proposed_slots) == 3
    assert interview.proposed_slots[0]["start_at"] == "2026-08-18T14:00:00+00:00"
    assert db.query(CalendarEvent).count() == 0


def test_approval_creates_mock_event_confirmations_reminders_and_manual_crm_export() -> None:
    db = _session()
    service = _service()
    interview = service.create_interview(
        db,
        _payload(
            candidate_availability="Tuesday works any time after 3. Wednesday morning works too.",
            client_availability="Tuesday after 2 or Wednesday morning.",
        ),
        "david@example.com",
    )

    service.approve_slot(db, interview, 0, "david@example.com")

    assert interview.state == InterviewState.SCHEDULED.value
    assert db.query(CalendarEvent).count() == 1
    assert db.query(Reminder).count() == 2
    assert db.query(Message).filter(Message.subject.like("Interview confirmed%")).count() == 2
    candidate_confirmation = next(
        message
        for message in db.query(Message).filter(Message.subject == "Interview confirmed - WPP").all()
        if message.recipient_emails == ["sarah@example.com"]
    )
    assert "calendar invite separately" in (candidate_confirmation.body_plain or "")
    assert "I've sent the calendar invite over as well" not in (candidate_confirmation.body_plain or "")


def test_repeat_approval_after_scheduled_is_idempotent() -> None:
    db = _session()
    service = _service()
    interview = service.create_interview(
        db,
        _payload(
            candidate_availability="Tuesday works any time after 3.",
            client_availability="Tuesday after 2 or Wednesday morning.",
        ),
        "david@example.com",
    )

    service.approve_slot(db, interview, 0, "david@example.com")
    service.approve_slot(db, interview, 0, "david@example.com")

    assert interview.state == InterviewState.SCHEDULED.value
    assert db.query(CalendarEvent).count() == 1
    assert db.query(Message).filter(Message.subject.like("Interview confirmed%")).count() == 2


def test_misconfigured_smtp_marks_message_failed(monkeypatch) -> None:
    db = _session()
    monkeypatch.setenv("EMAIL_PROVIDER", "smtp")
    monkeypatch.delenv("SMTP_HOST", raising=False)
    service = WorkflowService(settings=get_settings(), now_provider=lambda: datetime(2026, 8, 17, 9, 0, tzinfo=timezone.utc))

    interview = service.create_interview(db, _payload(), "david@example.com")

    failed_messages = db.query(Message).filter(Message.status == MessageStatus.FAILED.value).all()
    assert interview.state == InterviewState.AWAITING_BOTH.value
    assert len(failed_messages) == 2
    assert "SMTP email is selected" in (failed_messages[0].provider_error or "")


def test_reschedule_reply_pauses_reminders_and_preserves_existing_event() -> None:
    db = _session()
    service = _service()
    interview = service.create_interview(
        db,
        _payload(
            candidate_availability="Tuesday works any time after 3.",
            client_availability="Tuesday after 2 or Wednesday morning.",
        ),
        "david@example.com",
    )
    service.approve_slot(db, interview, 0, "david@example.com")

    service.receive_mock_reply(
        db,
        interview,
        "client",
        "Sorry, something has come up. Can we move this?",
        "david@example.com",
    )

    assert interview.state == InterviewState.RESCHEDULE_REQUESTED.value
    assert db.query(CalendarEvent).count() == 1
    assert db.query(Reminder).filter(Reminder.status == "paused").count() == 2


def test_new_availability_supersedes_stale_windows_before_matching() -> None:
    db = _session()
    service = _service()
    interview = service.create_interview(
        db,
        _payload(
            candidate_availability="Tuesday works any time after 3.",
            client_availability="Tuesday after 2 or Thursday morning.",
        ),
        "david@example.com",
    )

    assert interview.proposed_slots[0]["start_at"] == "2026-08-18T14:00:00+00:00"

    service.receive_mock_reply(
        db,
        interview,
        "candidate",
        "Thursday morning works instead.",
        "david@example.com",
    )

    assert interview.state == InterviewState.AWAITING_RECRUITER_APPROVAL.value
    assert interview.proposed_slots[0]["start_at"] == "2026-08-20T08:00:00+00:00"
    superseded_candidate_windows = (
        db.query(AvailabilityWindow)
        .filter(
            AvailabilityWindow.interview_id == interview.id,
            AvailabilityWindow.superseded_at.is_not(None),
        )
        .count()
    )
    assert superseded_candidate_windows == 1


def test_recruiter_calendar_conflicts_are_ignored_by_default() -> None:
    db = _session()
    busy_provider = MockCalendarProvider(
        busy=[
            CalendarBusyWindow(
                start_at=datetime(2026, 8, 18, 14, 0, tzinfo=timezone.utc),
                end_at=datetime(2026, 8, 18, 16, 0, tzinfo=timezone.utc),
                timezone="Europe/London",
                source_id="recruiter-busy",
            ),
        ],
    )
    service = WorkflowService(
        calendar_provider=busy_provider,
        now_provider=lambda: datetime(2026, 8, 17, 9, 0, tzinfo=timezone.utc),
    )

    interview = service.create_interview(
        db,
        _payload(
            candidate_availability="Tuesday works any time after 3.",
            client_availability="Tuesday after 2 or Wednesday morning.",
        ),
        "david@example.com",
    )

    assert interview.proposed_slots[0]["start_at"] == "2026-08-18T14:00:00+00:00"


def test_optional_recruiter_calendar_conflicts_filter_slots_when_enabled() -> None:
    db = _session()
    settings = replace(get_settings(), check_recruiter_calendar_conflicts=True)
    busy_provider = MockCalendarProvider(
        busy=[
            CalendarBusyWindow(
                start_at=datetime(2026, 8, 18, 14, 0, tzinfo=timezone.utc),
                end_at=datetime(2026, 8, 18, 16, 0, tzinfo=timezone.utc),
                timezone="Europe/London",
                source_id="recruiter-busy",
            ),
        ],
    )
    service = WorkflowService(
        settings=settings,
        calendar_provider=busy_provider,
        now_provider=lambda: datetime(2026, 8, 17, 9, 0, tzinfo=timezone.utc),
    )

    interview = service.create_interview(
        db,
        _payload(
            candidate_availability="Tuesday works any time after 3. Wednesday morning works too.",
            client_availability="Tuesday after 2 or Wednesday morning.",
        ),
        "david@example.com",
    )

    assert interview.proposed_slots[0]["start_at"] == "2026-08-19T08:00:00+00:00"


def test_reschedule_approval_updates_existing_event_and_replaces_reminders() -> None:
    db = _session()
    service = _service()
    interview = service.create_interview(
        db,
        _payload(
            candidate_availability="Tuesday works any time after 3.",
            client_availability="Tuesday after 2 or Wednesday morning.",
        ),
        "david@example.com",
    )
    service.approve_slot(db, interview, 0, "david@example.com")
    original_event = db.query(CalendarEvent).one()
    original_event_id = original_event.id
    original_provider_event_id = original_event.provider_event_id

    service.receive_mock_reply(db, interview, "client", "Sorry, can we move this?", "david@example.com")
    service.receive_mock_reply(db, interview, "candidate", "Thursday morning works.", "david@example.com")
    service.receive_mock_reply(db, interview, "client", "Thursday morning works.", "david@example.com")
    service.approve_slot(db, interview, 0, "david@example.com")

    updated_event = db.query(CalendarEvent).one()
    assert updated_event.id == original_event_id
    assert updated_event.provider_event_id == original_provider_event_id
    assert updated_event.status == CalendarEventStatus.UPDATED.value
    assert updated_event.start_at == datetime(2026, 8, 20, 8, 0, tzinfo=timezone.utc)
    assert db.query(Reminder).filter(Reminder.status == "cancelled").count() == 2
    assert db.query(Reminder).filter(Reminder.status == "scheduled").count() == 2
    assert db.query(Message).filter(Message.subject.like("Interview moved%")).count() == 2


def test_confirm_cancellation_requires_action_and_cancels_event_and_reminders() -> None:
    db = _session()
    service = _service()
    interview = service.create_interview(
        db,
        _payload(
            candidate_availability="Tuesday works any time after 3.",
            client_availability="Tuesday after 2 or Wednesday morning.",
        ),
        "david@example.com",
    )
    service.approve_slot(db, interview, 0, "david@example.com")

    service.receive_mock_reply(db, interview, "client", "Sorry, we need to cancel this.", "david@example.com")

    assert interview.state == InterviewState.CANCELLATION_REQUESTED.value
    assert db.query(CalendarEvent).filter(CalendarEvent.status == CalendarEventStatus.CREATED.value).count() == 1

    service.confirm_cancellation(db, interview, "david@example.com", "Client cancelled")

    assert interview.state == InterviewState.CANCELLED.value
    assert db.query(CalendarEvent).filter(CalendarEvent.status == CalendarEventStatus.CANCELLED.value).count() == 1
    assert db.query(Reminder).filter(Reminder.status == "cancelled").count() == 2
    assert db.query(Message).filter(Message.subject.like("Interview cancelled%")).count() == 2


def test_process_due_work_sends_due_reminders() -> None:
    db = _session()
    service = _service()
    interview = service.create_interview(
        db,
        _payload(
            candidate_availability="Tuesday works any time after 3.",
            client_availability="Tuesday after 2 or Wednesday morning.",
        ),
        "david@example.com",
    )
    service.approve_slot(db, interview, 0, "david@example.com")
    due_service = WorkflowService(now_provider=lambda: datetime(2026, 8, 18, 9, 0, tzinfo=timezone.utc))

    result = due_service.process_due_work(db, "david@example.com")

    assert result["reminders_sent"] == 2
    assert db.query(Reminder).filter(Reminder.status == "sent").count() == 2


def test_anonymize_interview_removes_candidate_and_client_personal_data() -> None:
    db = _session()
    service = _service()
    interview = service.create_interview(db, _payload(), "david@example.com")

    service.anonymize_interview(db, interview, "david@example.com")

    assert interview.candidate.full_name == "Redacted candidate"
    assert interview.client_contact.full_name == "Redacted client"
    assert interview.candidate.email.endswith("@example.invalid")
    assert all(message.body_plain is None for message in interview.messages)
    assert all(
        participant.email.endswith("@example.invalid")
        for participant in interview.participants
        if participant.participant_type != ParticipantType.RECRUITER.value and participant.email
    )


def test_calendar_failure_moves_workflow_to_error_without_confirmations() -> None:
    db = _session()
    service = WorkflowService(
        calendar_provider=FailingCalendarProvider(),
        now_provider=lambda: datetime(2026, 8, 17, 9, 0, tzinfo=timezone.utc),
    )
    interview = service.create_interview(
        db,
        _payload(
            candidate_availability="Tuesday works any time after 3.",
            client_availability="Tuesday after 2 or Wednesday morning.",
        ),
        "david@example.com",
    )

    service.approve_slot(db, interview, 0, "david@example.com")

    assert interview.state == InterviewState.ERROR.value
    assert db.query(CalendarEvent).count() == 0
    assert db.query(Message).filter(Message.subject.like("Interview confirmed%")).count() == 0

    service.calendar_provider = MockCalendarProvider()
    service.approve_slot(db, interview, 0, "david@example.com")

    assert interview.state == InterviewState.SCHEDULED.value
    assert db.query(CalendarEvent).count() == 1
