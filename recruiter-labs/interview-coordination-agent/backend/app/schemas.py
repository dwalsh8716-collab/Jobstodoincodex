from datetime import date, datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .enums import InterviewFormat, InterviewState


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    email: str
    expires_at: datetime


class CandidateInput(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=220)
    email: str = Field(..., min_length=5, max_length=320)
    mobile: Optional[str] = Field(default=None, max_length=80)
    timezone: str = Field(default="Europe/London", max_length=80)
    current_location: Optional[str] = Field(default=None, max_length=220)


class ClientInput(BaseModel):
    contact_name: str = Field(..., min_length=2, max_length=220)
    email: str = Field(..., min_length=5, max_length=320)
    company: str = Field(..., min_length=2, max_length=220)
    timezone: str = Field(default="Europe/London", max_length=80)


class InterviewerInput(BaseModel):
    name: str = Field(..., min_length=2, max_length=220)
    email: str = Field(..., min_length=5, max_length=320)
    timezone: str = Field(default="Europe/London", max_length=80)


class RoleInput(BaseModel):
    job_title: str = Field(..., min_length=2, max_length=240)
    company: str = Field(..., min_length=2, max_length=220)
    interview_stage: str = Field(..., min_length=2, max_length=160)
    interview_duration: int = Field(default=45, ge=15, le=240)
    interview_format: InterviewFormat = InterviewFormat.GOOGLE_MEET


class NewInterviewRequest(BaseModel):
    candidate: CandidateInput
    client: ClientInput
    role: RoleInput
    office_location: Optional[str] = Field(default=None, max_length=500)
    additional_interviewers: List[InterviewerInput] = Field(default_factory=list)
    preferred_date_range_start: Optional[date] = None
    preferred_date_range_end: Optional[date] = None
    client_availability_text: Optional[str] = None
    candidate_availability_text: Optional[str] = None
    notes: Optional[str] = None
    candidate_preparation_notes: Optional[str] = None
    recruiter_instructions: Optional[str] = None

    @field_validator("client_availability_text", "candidate_availability_text", "notes", "candidate_preparation_notes", "recruiter_instructions")
    @classmethod
    def empty_string_to_none(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        value = value.strip()
        return value or None


class MockReplyRequest(BaseModel):
    participant_type: str = Field(..., pattern="^(candidate|client)$")
    body: str = Field(..., min_length=2)
    received_at: Optional[datetime] = None


class ApproveSlotRequest(BaseModel):
    slot_index: int = Field(default=0, ge=0)


class CancelInterviewRequest(BaseModel):
    reason: Optional[str] = Field(default=None, max_length=1200)

    @field_validator("reason")
    @classmethod
    def clean_reason(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        value = value.strip()
        return value or None


class ProcessDueWorkResponse(BaseModel):
    reminders_sent: int
    chases_sent: int
    failures: List[str] = Field(default_factory=list)


class AnonymizeInterviewResponse(BaseModel):
    ok: bool
    message: str


class RetentionRedactionRequest(BaseModel):
    days: int = Field(default=180, ge=30, le=3650)


class RetentionRedactionResponse(BaseModel):
    redacted_messages: int


class AvailabilityWindowOut(BaseModel):
    id: str
    participant_type: str
    participant_name: str
    date: date
    start_at: datetime
    end_at: datetime
    timezone: str
    original_text: str
    interpretation: str
    confidence: float
    requires_clarification: bool


class PublicAvailabilityInfo(BaseModel):
    participant_name: str
    participant_type: str
    candidate_name: str
    client_name: str
    company_name: str
    job_title: str
    stage: str
    duration_minutes: int
    timezone: str
    expires_at: datetime
    submitted_at: Optional[datetime]


class PublicAvailabilityWindowInput(BaseModel):
    date: date
    start: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    end: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    timezone: str = Field(default="Europe/London", max_length=80)


class PublicAvailabilitySubmit(BaseModel):
    windows: List[PublicAvailabilityWindowInput] = Field(..., min_length=1, max_length=24)
    notes: Optional[str] = Field(default=None, max_length=1200)

    @field_validator("notes")
    @classmethod
    def clean_notes(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        value = value.strip()
        return value or None


class PublicAvailabilitySubmitResponse(BaseModel):
    ok: bool
    state: InterviewState
    message: str


class MessageOut(BaseModel):
    id: str
    direction: str
    channel: str
    sender_email: Optional[str]
    recipient_emails: List[str]
    subject: Optional[str]
    body_excerpt: Optional[str]
    body_plain: Optional[str]
    intent: Optional[str]
    intent_confidence: Optional[float]
    status: str
    provider_error: Optional[str] = None
    requires_approval: bool
    sent_at: Optional[datetime]
    received_at: Optional[datetime]
    created_at: datetime


class CalendarEventOut(BaseModel):
    id: str
    provider: str
    provider_event_id: Optional[str]
    meeting_url: Optional[str]
    location: Optional[str]
    title: str
    description: Optional[str]
    start_at: datetime
    end_at: datetime
    timezone: str
    status: str


class ReminderOut(BaseModel):
    id: str
    reminder_type: str
    scheduled_for: datetime
    channel: str
    status: str


class WorkflowEventOut(BaseModel):
    id: str
    event_type: str
    from_state: Optional[str]
    to_state: Optional[str]
    actor_type: str
    actor_id: Optional[str]
    metadata_json: Dict[str, Any]
    created_at: datetime


class CRMExportOut(BaseModel):
    id: str
    connector_name: str
    summary_text: str
    note_text: str
    created_at: datetime


class InterviewListItem(BaseModel):
    id: str
    workflow_public_id: str
    state: InterviewState
    candidate_name: str
    client_name: str
    company_name: str
    job_title: str
    stage: str
    format: str
    scheduled_start_at: Optional[datetime]
    updated_at: datetime


class InterviewDetail(BaseModel):
    id: str
    workflow_public_id: str
    state: InterviewState
    state_reason: Optional[str]
    candidate: Dict[str, Any]
    client: Dict[str, Any]
    company: Dict[str, Any]
    job: Dict[str, Any]
    stage: str
    duration_minutes: int
    format: str
    office_location: Optional[str]
    proposed_slots: List[Dict[str, Any]]
    scheduled_start_at: Optional[datetime]
    scheduled_end_at: Optional[datetime]
    availability_windows: List[AvailabilityWindowOut]
    messages: List[MessageOut]
    calendar_events: List[CalendarEventOut]
    reminders: List[ReminderOut]
    workflow_events: List[WorkflowEventOut]
    crm_export: Optional[CRMExportOut]


class DashboardResponse(BaseModel):
    counts: Dict[str, int]
    today: List[InterviewListItem]
    awaiting_responses: List[InterviewListItem]
    needs_approval: List[InterviewListItem]
    upcoming: List[InterviewListItem]
    reschedule_requests: List[InterviewListItem]
    completed: List[InterviewListItem]
    operational_alerts: List[InterviewListItem]
    activity_log: List[WorkflowEventOut]

    model_config = ConfigDict(from_attributes=True)
