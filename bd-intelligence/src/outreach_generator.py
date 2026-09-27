from __future__ import annotations

from typing import Any, Dict, Optional, Tuple

from .ai_prompts import (
    DAVID_TONE,
    call_opener_prompt,
    email_message_prompt,
    follow_up_message_prompt,
    linkedin_connection_request_prompt,
    linkedin_sales_nav_message_prompt,
)
from .config import get_settings
from .database import (
    connect,
    get_company_bundle,
    insert_outreach_message,
)


PROMPT_BUILDERS = {
    "linkedin_connection": linkedin_connection_request_prompt,
    "linkedin_sales_nav": linkedin_sales_nav_message_prompt,
    "email": email_message_prompt,
    "follow_up": follow_up_message_prompt,
    "call_opener": call_opener_prompt,
}


def _name(contact: Dict[str, Any]) -> str:
    return " ".join(
        part for part in (contact.get("first_name", ""), contact.get("last_name", "")) if part
    ).strip()


def fallback_message(
    channel: str,
    company: Dict[str, Any],
    contact: Dict[str, Any],
    signal: Dict[str, Any],
) -> Tuple[str, str]:
    first_name = contact.get("first_name") or "there"
    signal_title = signal.get("signal_title") or "a hiring signal"
    company_name = company.get("name", "your team")

    if channel == "email":
        subject = f"Quick one on {company_name}"
        body = (
            f"Hi {first_name},\n\n"
            f"I'll avoid the usual recruiter waffle. I noticed {signal_title.lower()} at {company_name}. "
            "If you can sort it directly, fair play. If it starts dragging, I know the senior marketing, "
            "digital and agency market well and may be able to help.\n\n"
            "No hard sell. Just thought it was worth a nudge.\n\n"
            "David"
        )
        return subject, body

    if channel == "call_opener":
        return "", (
            f"Hi {first_name}, it's David Walsh at Essential Resourcing. "
            f"I saw {company_name} had {signal_title.lower()} and wanted to sense-check whether it is sorted, "
            "or whether it has become one of those roles that looks simple on paper and then eats six weeks."
        )

    opener = f"Hi {first_name}, " if first_name != "there" else "Hi, "
    body = (
        opener
        + f"I'll avoid the usual recruiter waffle. Noticed {company_name} has {signal_title.lower()}. "
        "If it is under control, fair play. If it proves tricky, I know that market well and could be useful. "
        "No hard sell, just a sensible nudge."
    )
    return "", body


def call_openai(prompt: str, db_path: Optional[str] = None) -> Optional[str]:
    settings = get_settings(db_path)
    if not settings.openai_api_key:
        return None

    try:
        from openai import OpenAI

        client = OpenAI(api_key=settings.openai_api_key)
        response = client.responses.create(model=settings.openai_model, input=prompt)
        return response.output_text.strip()
    except Exception as exc:
        return f"[AI draft unavailable: {exc}]"


def split_subject_and_body(channel: str, text: str) -> Tuple[str, str]:
    if channel != "email":
        return "", text.strip()

    lines = [line.strip() for line in text.strip().splitlines() if line.strip()]
    if lines and lines[0].lower().startswith("subject"):
        subject = lines[0].split(":", 1)[-1].strip()
        body = "\n\n".join(lines[1:]).strip()
        return subject, body
    return "Quick one", text.strip()


def generate_outreach(
    company_id: int,
    channel: str,
    contact_id: Optional[int] = None,
    message_type: str = "first_touch",
    use_ai: bool = True,
    db_path: Optional[str] = None,
) -> Dict[str, Any]:
    if channel not in PROMPT_BUILDERS:
        raise ValueError(f"Unsupported channel: {channel}")

    with connect(db_path) as conn:
        bundle = get_company_bundle(conn, company_id)
        company = bundle["company"]
        contacts = bundle["contacts"]
        contact = (
            next((item for item in contacts if item["id"] == contact_id), None)
            if contact_id
            else (contacts[0] if contacts else {})
        )
        signal = bundle["signals"][0] if bundle["signals"] else {}

        prompt = PROMPT_BUILDERS[channel](company, contact, signal)
        draft = call_openai(prompt, db_path) if use_ai else None
        if not draft or draft.startswith("[AI draft unavailable"):
            subject, body = fallback_message(channel, company, contact, signal)
        else:
            subject, body = split_subject_and_body(channel, draft)

        message_id = insert_outreach_message(
            conn,
            {
                "company_id": company_id,
                "contact_id": contact.get("id") if contact else None,
                "channel": channel,
                "message_type": message_type,
                "subject_line": subject,
                "body": body,
                "tone": "David Walsh: " + DAVID_TONE[:80],
                "status": "Draft",
            },
        )
        conn.commit()
        return {
            "id": message_id,
            "company_id": company_id,
            "contact_id": contact.get("id") if contact else None,
            "contact_name": _name(contact) if contact else "",
            "channel": channel,
            "subject_line": subject,
            "body": body,
            "status": "Draft",
        }
