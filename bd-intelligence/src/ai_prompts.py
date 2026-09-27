from __future__ import annotations

import json
from typing import Any, Dict, List


DAVID_TONE = """
Write like David Walsh at Essential Resourcing:
human, short, direct, warm, commercially aware, slightly cheeky where natural.
No corporate waffle. No generic recruiter spam. No fake familiarity.
Never use "I hope this email finds you well". Be honest about being a recruiter.
This is human-in-the-loop drafting only. Do not imply anything has been sent.
""".strip()


def signal_summary_prompt(signal: Dict[str, Any]) -> str:
    return f"""
{DAVID_TONE}

Summarise this hiring or growth signal in plain English.
Return:
- what happened
- why it might matter commercially
- whether it is worth a BD follow-up

Signal:
{json.dumps(signal, indent=2, ensure_ascii=True)}
""".strip()


def lead_scoring_prompt(
    company: Dict[str, Any], signals: List[Dict[str, Any]], score_breakdown: List[Dict[str, Any]]
) -> str:
    return f"""
{DAVID_TONE}

Explain the lead score briefly for a recruiter reviewing BD opportunities.
Keep it honest. If the signal is weak, say so.

Company:
{json.dumps(company, indent=2, ensure_ascii=True)}

Signals:
{json.dumps(signals[:5], indent=2, ensure_ascii=True)}

Score breakdown:
{json.dumps(score_breakdown, indent=2, ensure_ascii=True)}
""".strip()


def linkedin_connection_request_prompt(
    company: Dict[str, Any], contact: Dict[str, Any], signal: Dict[str, Any]
) -> str:
    return outreach_prompt("LinkedIn connection request", company, contact, signal)


def linkedin_sales_nav_message_prompt(
    company: Dict[str, Any], contact: Dict[str, Any], signal: Dict[str, Any]
) -> str:
    return outreach_prompt("LinkedIn Sales Navigator message", company, contact, signal)


def email_message_prompt(company: Dict[str, Any], contact: Dict[str, Any], signal: Dict[str, Any]) -> str:
    return outreach_prompt("Email", company, contact, signal)


def follow_up_message_prompt(
    company: Dict[str, Any], contact: Dict[str, Any], signal: Dict[str, Any]
) -> str:
    return outreach_prompt("Follow-up message", company, contact, signal)


def call_opener_prompt(company: Dict[str, Any], contact: Dict[str, Any], signal: Dict[str, Any]) -> str:
    return outreach_prompt("Call opener", company, contact, signal)


def outreach_prompt(
    channel_label: str,
    company: Dict[str, Any],
    contact: Dict[str, Any],
    signal: Dict[str, Any],
) -> str:
    return f"""
{DAVID_TONE}

Draft a {channel_label}.
Keep it specific to the signal. Make it clear David is not auto-spamming.
Do not overclaim. Do not invent relationships, outcomes, jobs or salary data.
If it is an email, include a short subject line followed by the body.

Company:
{json.dumps(company, indent=2, ensure_ascii=True)}

Contact:
{json.dumps(contact or {}, indent=2, ensure_ascii=True)}

Signal:
{json.dumps(signal or {}, indent=2, ensure_ascii=True)}
""".strip()

