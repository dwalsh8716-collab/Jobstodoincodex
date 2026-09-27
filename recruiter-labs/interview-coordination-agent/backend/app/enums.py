from enum import Enum


class InterviewState(str, Enum):
    DRAFT = "DRAFT"
    STARTED = "STARTED"
    AWAITING_CLIENT_AVAILABILITY = "AWAITING_CLIENT_AVAILABILITY"
    AWAITING_CANDIDATE_AVAILABILITY = "AWAITING_CANDIDATE_AVAILABILITY"
    AWAITING_BOTH = "AWAITING_BOTH"
    MATCHING_AVAILABILITY = "MATCHING_AVAILABILITY"
    AWAITING_RECRUITER_APPROVAL = "AWAITING_RECRUITER_APPROVAL"
    APPROVED = "APPROVED"
    SCHEDULED = "SCHEDULED"
    REMINDER_PENDING = "REMINDER_PENDING"
    RESCHEDULE_REQUESTED = "RESCHEDULE_REQUESTED"
    CANCELLATION_REQUESTED = "CANCELLATION_REQUESTED"
    COMPLETED = "COMPLETED"
    FEEDBACK_PENDING = "FEEDBACK_PENDING"
    CANCELLED = "CANCELLED"
    ESCALATED = "ESCALATED"
    ERROR = "ERROR"


class InterviewFormat(str, Enum):
    MICROSOFT_TEAMS = "Microsoft Teams"
    GOOGLE_MEET = "Google Meet"
    ZOOM = "Zoom"
    TELEPHONE = "Telephone"
    IN_PERSON = "In person"
    OTHER = "Other"


class ParticipantType(str, Enum):
    CANDIDATE = "candidate"
    CLIENT_CONTACT = "client_contact"
    INTERVIEWER = "interviewer"
    RECRUITER = "recruiter"
    OTHER = "other"


class MessageDirection(str, Enum):
    INBOUND = "inbound"
    OUTBOUND = "outbound"


class MessageStatus(str, Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    MOCK_SENT = "mock_sent"
    SENT = "sent"
    RECEIVED = "received"
    FAILED = "failed"
    SKIPPED = "skipped"


class Intent(str, Enum):
    AVAILABILITY_RESPONSE = "availability_response"
    RESCHEDULE_REQUEST = "reschedule_request"
    CANCELLATION_REQUEST = "cancellation_request"
    CONFIRMATION = "confirmation"
    OTHER = "other"


class CalendarEventStatus(str, Enum):
    DRAFT = "draft"
    CREATED = "created"
    UPDATED = "updated"
    CANCELLED = "cancelled"
    FAILED = "failed"
