import uuid

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    UniqueConstraint,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from .database import Base
from .enums import (
    CalendarEventStatus,
    InterviewFormat,
    InterviewState,
    MessageDirection,
    MessageStatus,
)


def uuid_str() -> str:
    return str(uuid.uuid4())


class TimestampMixin:
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=uuid_str)
    email = Column(String(320), nullable=False, unique=True, index=True)
    display_name = Column(String(180), nullable=False)
    role = Column(String(40), nullable=False, default="owner")
    auth_provider = Column(String(40), nullable=False, default="local")
    status = Column(String(40), nullable=False, default="active")
    timezone = Column(String(80), nullable=False, default="Europe/London")


class Company(Base, TimestampMixin):
    __tablename__ = "companies"

    id = Column(String(36), primary_key=True, default=uuid_str)
    name = Column(String(220), nullable=False, index=True)
    website = Column(String(500))
    notes = Column(Text)


class Candidate(Base, TimestampMixin):
    __tablename__ = "candidates"

    id = Column(String(36), primary_key=True, default=uuid_str)
    full_name = Column(String(220), nullable=False, index=True)
    email = Column(String(320), nullable=False, index=True)
    mobile = Column(String(80))
    timezone = Column(String(80), nullable=False, default="Europe/London")
    current_location = Column(String(220))
    deleted_at = Column(DateTime(timezone=True))


class ClientContact(Base, TimestampMixin):
    __tablename__ = "client_contacts"

    id = Column(String(36), primary_key=True, default=uuid_str)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    full_name = Column(String(220), nullable=False, index=True)
    email = Column(String(320), nullable=False, index=True)
    timezone = Column(String(80), nullable=False, default="Europe/London")
    phone = Column(String(80))

    company = relationship("Company")


class Job(Base, TimestampMixin):
    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, default=uuid_str)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    title = Column(String(240), nullable=False, index=True)
    company_display_name = Column(String(220), nullable=False)
    notes = Column(Text)

    company = relationship("Company")


class Interview(Base, TimestampMixin):
    __tablename__ = "interviews"

    id = Column(String(36), primary_key=True, default=uuid_str)
    workflow_public_id = Column(String(40), nullable=False, unique=True, index=True)
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False)
    client_contact_id = Column(String(36), ForeignKey("client_contacts.id"), nullable=False)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    job_id = Column(String(36), ForeignKey("jobs.id"), nullable=False)
    owner_user_id = Column(String(36), ForeignKey("users.id"))
    stage = Column(String(160), nullable=False)
    duration_minutes = Column(Integer, nullable=False, default=45)
    format = Column(String(80), nullable=False, default=InterviewFormat.GOOGLE_MEET.value)
    office_location = Column(String(500))
    preferred_date_range_start = Column(Date)
    preferred_date_range_end = Column(Date)
    candidate_preparation_notes = Column(Text)
    recruiter_instructions = Column(Text)
    notes = Column(Text)
    state = Column(String(80), nullable=False, default=InterviewState.DRAFT.value, index=True)
    state_reason = Column(Text)
    approval_required = Column(Boolean, nullable=False, default=True)
    proposed_slots = Column(JSON, nullable=False, default=list)
    approved_slot_start_at = Column(DateTime(timezone=True))
    approved_slot_end_at = Column(DateTime(timezone=True))
    approved_slot_timezone = Column(String(80))
    scheduled_start_at = Column(DateTime(timezone=True), index=True)
    scheduled_end_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    cancelled_at = Column(DateTime(timezone=True))

    candidate = relationship("Candidate")
    client_contact = relationship("ClientContact")
    company = relationship("Company")
    job = relationship("Job")
    participants = relationship("InterviewParticipant", cascade="all, delete-orphan")
    availability_windows = relationship("AvailabilityWindow", cascade="all, delete-orphan")
    messages = relationship("Message", cascade="all, delete-orphan")
    calendar_events = relationship("CalendarEvent", cascade="all, delete-orphan")
    reminders = relationship("Reminder", cascade="all, delete-orphan")
    workflow_events = relationship("WorkflowEvent", cascade="all, delete-orphan")


class InterviewParticipant(Base, TimestampMixin):
    __tablename__ = "interview_participants"

    id = Column(String(36), primary_key=True, default=uuid_str)
    interview_id = Column(String(36), ForeignKey("interviews.id"), nullable=False, index=True)
    participant_type = Column(String(40), nullable=False, index=True)
    person_id = Column(String(36))
    name = Column(String(220), nullable=False)
    email = Column(String(320))
    timezone = Column(String(80), nullable=False, default="Europe/London")
    calendar_required = Column(Boolean, nullable=False, default=True)
    response_required = Column(Boolean, nullable=False, default=True)


class AvailabilityWindow(Base, TimestampMixin):
    __tablename__ = "availability_windows"

    id = Column(String(36), primary_key=True, default=uuid_str)
    interview_id = Column(String(36), ForeignKey("interviews.id"), nullable=False, index=True)
    participant_id = Column(String(36), ForeignKey("interview_participants.id"), nullable=False)
    source_message_id = Column(String(36), ForeignKey("messages.id"))
    source = Column(String(40), nullable=False, default="manual")
    date = Column(Date, nullable=False)
    start_at = Column(DateTime(timezone=True), nullable=False)
    end_at = Column(DateTime(timezone=True), nullable=False)
    timezone = Column(String(80), nullable=False)
    original_text = Column(Text, nullable=False)
    interpretation = Column(Text, nullable=False)
    confidence = Column(Float, nullable=False, default=0.0)
    requires_clarification = Column(Boolean, nullable=False, default=False)
    superseded_at = Column(DateTime(timezone=True))

    participant = relationship("InterviewParticipant")


class AvailabilityLink(Base, TimestampMixin):
    __tablename__ = "availability_links"

    id = Column(String(36), primary_key=True, default=uuid_str)
    interview_id = Column(String(36), ForeignKey("interviews.id"), nullable=False, index=True)
    participant_id = Column(String(36), ForeignKey("interview_participants.id"), nullable=False, index=True)
    participant_type = Column(String(40), nullable=False, index=True)
    email = Column(String(320), nullable=False, index=True)
    token_hash = Column(String(128), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    submitted_at = Column(DateTime(timezone=True))
    revoked_at = Column(DateTime(timezone=True))
    status = Column(String(40), nullable=False, default="active")

    interview = relationship("Interview")
    participant = relationship("InterviewParticipant")


class EmailThread(Base, TimestampMixin):
    __tablename__ = "email_threads"

    id = Column(String(36), primary_key=True, default=uuid_str)
    interview_id = Column(String(36), ForeignKey("interviews.id"), nullable=False, index=True)
    provider = Column(String(40), nullable=False, default="mock")
    provider_thread_id = Column(String(180), nullable=False, index=True)
    workflow_public_id = Column(String(40), nullable=False, index=True)
    participants_hash = Column(String(128))
    started_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    last_message_at = Column(DateTime(timezone=True))
    status = Column(String(40), nullable=False, default="open")


class Message(Base, TimestampMixin):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=uuid_str)
    interview_id = Column(String(36), ForeignKey("interviews.id"), nullable=False, index=True)
    email_thread_id = Column(String(36), ForeignKey("email_threads.id"))
    direction = Column(String(20), nullable=False, default=MessageDirection.OUTBOUND.value)
    channel = Column(String(40), nullable=False, default="email")
    sender_email = Column(String(320))
    recipient_emails = Column(JSON, nullable=False, default=list)
    subject = Column(String(300))
    body_plain = Column(Text)
    body_excerpt = Column(Text)
    provider_message_id = Column(String(180), index=True)
    provider_thread_id = Column(String(180), index=True)
    workflow_public_id = Column(String(40), index=True)
    intent = Column(String(80))
    intent_confidence = Column(Float)
    status = Column(String(40), nullable=False, default=MessageStatus.DRAFT.value, index=True)
    provider_error = Column(Text)
    requires_approval = Column(Boolean, nullable=False, default=False)
    approved_by_user_id = Column(String(36), ForeignKey("users.id"))
    approved_at = Column(DateTime(timezone=True))
    sent_at = Column(DateTime(timezone=True))
    received_at = Column(DateTime(timezone=True))


class CalendarEvent(Base, TimestampMixin):
    __tablename__ = "calendar_events"

    id = Column(String(36), primary_key=True, default=uuid_str)
    interview_id = Column(String(36), ForeignKey("interviews.id"), nullable=False, index=True)
    provider = Column(String(40), nullable=False, default="mock")
    provider_calendar_id = Column(String(180))
    provider_event_id = Column(String(180), index=True)
    provider_event_etag = Column(String(180))
    meeting_url = Column(String(500))
    location = Column(String(500))
    title = Column(String(300), nullable=False)
    description = Column(Text)
    start_at = Column(DateTime(timezone=True), nullable=False)
    end_at = Column(DateTime(timezone=True), nullable=False)
    timezone = Column(String(80), nullable=False)
    status = Column(String(40), nullable=False, default=CalendarEventStatus.DRAFT.value)
    created_by_user_id = Column(String(36), ForeignKey("users.id"))
    cancelled_at = Column(DateTime(timezone=True))


class WorkflowOperation(Base):
    __tablename__ = "workflow_operations"
    __table_args__ = (UniqueConstraint("operation_key", name="uq_workflow_operations_operation_key"),)

    id = Column(String(36), primary_key=True, default=uuid_str)
    interview_id = Column(String(36), ForeignKey("interviews.id"), nullable=False, index=True)
    operation_key = Column(String(220), nullable=False, index=True)
    operation_type = Column(String(80), nullable=False, index=True)
    status = Column(String(40), nullable=False, default="in_progress", index=True)
    provider = Column(String(40))
    provider_reference = Column(String(180))
    request_payload = Column(JSON, nullable=False, default=dict)
    error = Column(Text)
    started_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    completed_at = Column(DateTime(timezone=True))


class Reminder(Base, TimestampMixin):
    __tablename__ = "reminders"

    id = Column(String(36), primary_key=True, default=uuid_str)
    interview_id = Column(String(36), ForeignKey("interviews.id"), nullable=False, index=True)
    participant_id = Column(String(36), ForeignKey("interview_participants.id"))
    reminder_type = Column(String(80), nullable=False)
    scheduled_for = Column(DateTime(timezone=True), nullable=False, index=True)
    channel = Column(String(40), nullable=False, default="email")
    status = Column(String(40), nullable=False, default="scheduled")
    provider_message_id = Column(String(180))
    paused_at = Column(DateTime(timezone=True))
    sent_at = Column(DateTime(timezone=True))
    failed_at = Column(DateTime(timezone=True))


class WorkflowEvent(Base):
    __tablename__ = "workflow_events"

    id = Column(String(36), primary_key=True, default=uuid_str)
    interview_id = Column(String(36), ForeignKey("interviews.id"), nullable=False, index=True)
    event_type = Column(String(100), nullable=False, index=True)
    from_state = Column(String(80))
    to_state = Column(String(80))
    actor_type = Column(String(40), nullable=False, default="system")
    actor_id = Column(String(180))
    metadata_json = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=uuid_str)
    actor_type = Column(String(40), nullable=False, default="system")
    actor_id = Column(String(180))
    action = Column(String(120), nullable=False, index=True)
    entity_type = Column(String(80), nullable=False)
    entity_id = Column(String(36), nullable=False, index=True)
    summary = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=False, default=dict)
    ip_address_hash = Column(String(128))
    user_agent_hash = Column(String(128))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())


class Setting(Base, TimestampMixin):
    __tablename__ = "settings"

    id = Column(String(36), primary_key=True, default=uuid_str)
    scope = Column(String(40), nullable=False, default="organisation")
    scope_id = Column(String(36))
    key = Column(String(120), nullable=False, index=True)
    value = Column(JSON, nullable=False, default=dict)


class IntegrationConnection(Base, TimestampMixin):
    __tablename__ = "integration_connections"

    id = Column(String(36), primary_key=True, default=uuid_str)
    user_id = Column(String(36), ForeignKey("users.id"))
    provider_type = Column(String(40), nullable=False)
    provider_name = Column(String(80), nullable=False)
    account_email = Column(String(320))
    scopes = Column(JSON, nullable=False, default=list)
    access_token_ciphertext = Column(Text)
    refresh_token_ciphertext = Column(Text)
    expires_at = Column(DateTime(timezone=True))
    status = Column(String(40), nullable=False, default="not_connected")
    last_error = Column(Text)


class OAuthState(Base):
    __tablename__ = "oauth_states"
    __table_args__ = (UniqueConstraint("state_hash", name="uq_oauth_states_state_hash"),)

    id = Column(String(36), primary_key=True, default=uuid_str)
    provider_name = Column(String(80), nullable=False, index=True)
    state_hash = Column(String(128), nullable=False, index=True)
    user_email = Column(String(320), nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    used_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())


class CRMExport(Base):
    __tablename__ = "crm_exports"

    id = Column(String(36), primary_key=True, default=uuid_str)
    interview_id = Column(String(36), ForeignKey("interviews.id"), nullable=False, index=True)
    connector_name = Column(String(80), nullable=False, default="manual")
    summary_text = Column(Text, nullable=False)
    note_text = Column(Text, nullable=False)
    copied_at = Column(DateTime(timezone=True))
    downloaded_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
