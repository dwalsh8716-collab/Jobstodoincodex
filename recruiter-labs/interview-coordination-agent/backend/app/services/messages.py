from datetime import datetime
from typing import Iterable, List, Optional

from app.enums import MessageStatus
from app.models import Interview, Message
from app.services.providers import EmailProvider, EmailSendRequest


def _first_name(name: str) -> str:
    return name.split()[0] if name else ""


def _excerpt(body: str) -> str:
    compact = " ".join(body.split())
    return compact[:240]


def format_known_availability(lines: Iterable[str]) -> str:
    clean_lines = [line.strip() for line in lines if line.strip()]
    return "\n".join(clean_lines)


def _link_lines(availability_link: Optional[str]) -> List[str]:
    if not availability_link:
        return []
    return [
        "",
        "If easier, you can mark a few windows here:",
        availability_link,
    ]


def client_availability_body(client_name: str, candidate_name: str, availability_link: Optional[str] = None) -> str:
    return "\n".join(
        [
            f"Hi {_first_name(client_name)},",
            "",
            "Great, thanks.",
            "",
            f"Can you send me a couple of windows that work for you/the team over the next few days and I'll coordinate everything with {_first_name(candidate_name)}?",
            *_link_lines(availability_link),
            "",
            "Cheers,",
            "David",
        ],
    )


def candidate_availability_body(
    candidate_name: str,
    client_availability: Optional[str] = None,
    availability_link: Optional[str] = None,
) -> str:
    if client_availability:
        return "\n".join(
            [
                f"Hi {_first_name(candidate_name)},",
                "",
                "Good news - they'd like to meet you.",
                "",
                "They can currently do:",
                "",
                client_availability,
                "",
                "Do any of those work for you?",
                *_link_lines(availability_link),
                "",
                "Cheers,",
                "David",
            ],
        )

    return "\n".join(
        [
            f"Hi {_first_name(candidate_name)},",
            "",
            "Good news - they'd like to meet you.",
            "",
            "Can you send me a couple of times that work over the next few days and I'll get everything coordinated?",
            *_link_lines(availability_link),
            "",
            "Cheers,",
            "David",
        ],
    )


def candidate_confirmation_body(
    candidate_name: str,
    company_name: str,
    slot_label: str,
    interviewer_name: str,
    calendar_invite_sent: bool,
    meeting_link: Optional[str] = None,
) -> str:
    calendar_line = (
        "I've sent the calendar invite over as well."
        if calendar_invite_sent
        else "I'll send the calendar invite separately once the final admin is checked."
    )
    meeting_lines = ["", f"Link: {meeting_link}"] if meeting_link else []
    return "\n".join(
        [
            "All sorted.",
            "",
            f"You're booked in with {company_name} for {slot_label}.",
            "",
            f"You'll be meeting {interviewer_name}.",
            "",
            calendar_line,
            *meeting_lines,
            "",
            "I'll give you a shout beforehand, but if anything changes just let me know.",
            "",
            "Cheers,",
            "David",
        ],
    )


def client_confirmation_body(
    client_name: str,
    candidate_name: str,
    slot_label: str,
    calendar_invite_sent: bool,
) -> str:
    del client_name
    calendar_line = (
        "Calendar invite has gone across to everyone."
        if calendar_invite_sent
        else "I'll send the calendar invite separately once the final admin is checked."
    )
    return "\n".join(
        [
            "All confirmed.",
            "",
            f"{candidate_name} is booked in for {slot_label}.",
            "",
            calendar_line,
            "",
            "Give me a shout if anything changes.",
            "",
            "Cheers,",
            "David",
        ],
    )


def candidate_reschedule_confirmation_body(
    candidate_name: str,
    company_name: str,
    slot_label: str,
    calendar_invite_sent: bool,
    meeting_link: Optional[str] = None,
) -> str:
    calendar_line = (
        "I have updated the calendar invite as well."
        if calendar_invite_sent
        else "I will send the calendar invite separately once the final admin is checked."
    )
    meeting_lines = ["", f"Link: {meeting_link}"] if meeting_link else []
    return "\n".join(
        [
            f"Hi {_first_name(candidate_name)},",
            "",
            f"All sorted - we have moved the {company_name} interview to {slot_label}.",
            "",
            calendar_line,
            *meeting_lines,
            "",
            "Give me a shout if anything else changes.",
            "",
            "Cheers,",
            "David",
        ],
    )


def client_reschedule_confirmation_body(
    client_name: str,
    candidate_name: str,
    slot_label: str,
    calendar_invite_sent: bool,
) -> str:
    calendar_line = (
        "Calendar invite has been updated for everyone."
        if calendar_invite_sent
        else "I will send the calendar invite separately once the final admin is checked."
    )
    return "\n".join(
        [
            f"Hi {_first_name(client_name)},",
            "",
            f"All moved. {candidate_name} is now booked in for {slot_label}.",
            "",
            calendar_line,
            "",
            "Give me a shout if anything else changes.",
            "",
            "Cheers,",
            "David",
        ],
    )


def candidate_cancellation_body(candidate_name: str, company_name: str, calendar_invite_removed: bool) -> str:
    calendar_line = (
        "The calendar invite has been removed as well."
        if calendar_invite_removed
        else "I will tidy the calendar invite separately once the final admin is checked."
    )
    return "\n".join(
        [
            f"Hi {_first_name(candidate_name)},",
            "",
            f"Just confirming the {company_name} interview has been cancelled for now.",
            "",
            calendar_line,
            "",
            "I will come back to you if anything changes.",
            "",
            "Cheers,",
            "David",
        ],
    )


def client_cancellation_body(client_name: str, candidate_name: str, calendar_invite_removed: bool) -> str:
    calendar_line = (
        "Calendar invite has been removed."
        if calendar_invite_removed
        else "I will tidy the calendar invite separately once the final admin is checked."
    )
    return "\n".join(
        [
            f"Hi {_first_name(client_name)},",
            "",
            f"Just confirming the interview with {candidate_name} has been cancelled for now.",
            "",
            calendar_line,
            "",
            "Give me a shout if you want to revisit it.",
            "",
            "Cheers,",
            "David",
        ],
    )


def reminder_body(name: str, company_name: str, slot_label: str) -> str:
    return "\n".join(
        [
            f"Hi {_first_name(name)},",
            "",
            f"Quick reminder you are booked in with {company_name} {slot_label}.",
            "",
            "Give me a shout if anything has changed.",
            "",
            "Cheers,",
            "David",
        ],
    )


def recruiter_reminder_body(candidate_name: str, company_name: str, job_title: str, slot_label: str) -> str:
    return "\n".join(
        [
            "Interview today:",
            "",
            f"{candidate_name}",
            f"{job_title}",
            company_name,
            "",
            f"Booked for {slot_label}.",
        ],
    )


def chase_availability_body(name: str) -> str:
    return "\n".join(
        [
            f"Hi {_first_name(name)},",
            "",
            "Just giving this a quick nudge in case it got buried.",
            "",
            "Send me a couple of times when you get a chance and I will get it sorted.",
            "",
            "Cheers,",
            "David",
        ],
    )


def clarification_body(name: str) -> str:
    return "\n".join(
        [
            f"Hi {_first_name(name)},",
            "",
            "Just checking the timings on that so I don't make a mess of it.",
            "",
            "Can you send me one or two specific windows that work?",
            "",
            "Cheers,",
            "David",
        ],
    )


class MessageService:
    def __init__(self, provider: EmailProvider) -> None:
        self.provider = provider

    def send_outbound(
        self,
        interview: Interview,
        to: List[str],
        subject: str,
        body: str,
        requires_approval: bool = False,
        auto_send_allowed: bool = True,
    ) -> Message:
        status = MessageStatus.PENDING_APPROVAL.value if requires_approval or not auto_send_allowed else MessageStatus.SENT.value
        provider_message_id = None
        provider_thread_id = None
        sent_at = None
        provider_error = None

        if status == MessageStatus.SENT.value:
            try:
                result = self.provider.send_message(
                    EmailSendRequest(
                        to=to,
                        subject=subject,
                        body=body,
                        workflow_public_id=interview.workflow_public_id,
                    ),
                )
                provider_message_id = result.provider_message_id
                provider_thread_id = result.provider_thread_id
                sent_at = result.sent_at
                if getattr(self.provider, "provider", "mock") == "mock":
                    status = MessageStatus.MOCK_SENT.value
            except Exception as exc:
                status = MessageStatus.FAILED.value
                provider_error = str(exc)

        return Message(
            interview_id=interview.id,
            direction="outbound",
            channel="email",
            sender_email=getattr(self.provider, "from_email", "david@essentialresourcing.co.uk"),
            recipient_emails=to,
            subject=subject,
            body_plain=body,
            body_excerpt=_excerpt(body),
            provider_message_id=provider_message_id,
            provider_thread_id=provider_thread_id,
            workflow_public_id=interview.workflow_public_id,
            status=status,
            provider_error=provider_error,
            requires_approval=requires_approval or not auto_send_allowed,
            sent_at=sent_at,
        )

    def inbound(
        self,
        interview: Interview,
        sender_email: str,
        body: str,
        intent: str,
        confidence: float,
        received_at: Optional[datetime] = None,
        channel: str = "email",
        provider_message_id: Optional[str] = None,
        provider_thread_id: Optional[str] = None,
        recipient_emails: Optional[List[str]] = None,
    ) -> Message:
        return Message(
            interview_id=interview.id,
            direction="inbound",
            channel=channel,
            sender_email=sender_email,
            recipient_emails=recipient_emails or ["david@essentialresourcing.co.uk"],
            subject=f"Re: Interview coordination {interview.workflow_public_id}",
            body_plain=body,
            body_excerpt=_excerpt(body),
            provider_message_id=provider_message_id or f"mock_inbound_{interview.workflow_public_id}_{datetime.utcnow().timestamp()}",
            provider_thread_id=provider_thread_id or f"mock_thread_{interview.workflow_public_id}",
            workflow_public_id=interview.workflow_public_id,
            intent=intent,
            intent_confidence=confidence,
            status=MessageStatus.RECEIVED.value,
            received_at=received_at or datetime.utcnow(),
        )
