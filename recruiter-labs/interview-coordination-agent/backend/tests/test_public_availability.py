from datetime import datetime, timedelta, timezone
import re

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import models  # noqa: F401
from app.database import Base, get_db
from app.enums import InterviewFormat, InterviewState
from app.main import app
from app.models import AvailabilityLink, AvailabilityWindow, Message
from app.schemas import CandidateInput, ClientInput, NewInterviewRequest, RoleInput
from app.services.availability_links import create_availability_link, find_active_availability_link
from app.services.workflow import WorkflowService
from app.config import get_settings


def _session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)()


def _payload():
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
    )


def _token_from_message(message: Message) -> str:
    match = re.search(r"/availability/([A-Za-z0-9_-]+)", message.body_plain or "")
    assert match
    return match.group(1)


def test_availability_links_store_hash_not_raw_token() -> None:
    db = _session()
    service = WorkflowService(now_provider=lambda: datetime(2026, 8, 17, 9, 0, tzinfo=timezone.utc))
    interview = service.create_interview(db, _payload(), "david@example.com")
    participant = interview.participants[0]

    url = create_availability_link(db, get_settings(), interview, participant)
    token = url.rsplit("/", 1)[1]
    stored = db.query(AvailabilityLink).filter(AvailabilityLink.token_hash.is_not(None)).all()

    assert token not in [link.token_hash for link in stored]
    assert find_active_availability_link(db, get_settings(), token) is not None


def test_public_availability_submission_updates_workflow() -> None:
    db = _session()
    service = WorkflowService(now_provider=lambda: datetime(2026, 8, 17, 9, 0, tzinfo=timezone.utc))
    interview = service.create_interview(db, _payload(), "david@example.com")
    candidate_message = next(
        message
        for message in db.query(Message).filter(Message.subject == "Interview availability - WPP").all()
        if message.recipient_emails == ["sarah@example.com"]
    )
    token = _token_from_message(candidate_message)

    def override_db():
        yield db

    app.dependency_overrides[get_db] = override_db
    client = TestClient(app)
    try:
        tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).date().isoformat()
        response = client.post(
            f"/api/public/availability/{token}",
            json={
                "windows": [
                    {
                        "date": tomorrow,
                        "start": "09:00",
                        "end": "12:00",
                        "timezone": "Europe/London",
                    },
                ],
                "notes": "Morning is easiest.",
            },
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert db.query(AvailabilityWindow).count() == 1
    assert db.query(AvailabilityLink).filter(AvailabilityLink.status == "submitted").count() == 1
    assert interview.state == InterviewState.AWAITING_CLIENT_AVAILABILITY.value
