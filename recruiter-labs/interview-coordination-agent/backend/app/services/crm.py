from datetime import datetime
from zoneinfo import ZoneInfo

from app.models import Interview


class CRMConnector:
    name = "base"

    def build_interview_summary(self, interview: Interview) -> str:
        raise NotImplementedError

    def build_note(self, interview: Interview) -> str:
        raise NotImplementedError


class ManualCRMConnector(CRMConnector):
    name = "manual"

    def build_interview_summary(self, interview: Interview) -> str:
        slot = _slot_label(interview)
        return "\n".join(
            [
                "INTERVIEW SUMMARY",
                "",
                "Candidate:",
                interview.candidate.full_name,
                "",
                "Client:",
                interview.company.name,
                "",
                "Role:",
                interview.job.title,
                "",
                "Interview:",
                slot,
                "",
                "Stage:",
                interview.stage,
                "",
                "Status:",
                "Confirmed",
            ],
        )

    def build_note(self, interview: Interview) -> str:
        slot = _slot_label(interview)
        return f"Interview confirmed: {interview.candidate.full_name} with {interview.company.name} for {interview.job.title}, {interview.stage}, {slot}."


def _slot_label(interview: Interview) -> str:
    if not interview.scheduled_start_at:
        return "To be confirmed"
    timezone_name = interview.approved_slot_timezone or interview.candidate.timezone or "Europe/London"
    local = interview.scheduled_start_at.astimezone(ZoneInfo(timezone_name))
    return local.strftime("%A %d %B %Y, %H:%M %Z")

