from __future__ import annotations

import json
import re
from typing import Any, Dict, Iterable, List, Tuple

from .database import (
    connect,
    initialize_database,
    insert_lead_score,
    list_companies,
    list_contacts,
    list_signals,
)
from .models import DECISION_MAKER_TITLES, RELEVANT_JOB_TITLES, TARGET_SECTOR_KEYWORDS


MANCHESTER_NW_TERMS = (
    "manchester",
    "north west",
    "north-west",
    "salford",
    "stockport",
    "bolton",
    "bury",
    "oldham",
    "rochdale",
    "trafford",
    "cheshire",
    "lancashire",
    "liverpool",
    "leeds",
)

UK_RELEVANT_TERMS = ("uk", "united kingdom", "remote", "hybrid", "london", "birmingham", "bristol")

GROWTH_TERMS = (
    "growth",
    "funding",
    "investment",
    "acquisition",
    "acquired",
    "client win",
    "new client",
    "expansion",
    "scale",
    "private equity",
)

STALE_ROLE_TERMS = ("reposted", "still live", "live a while", "30 days", "60 days", "urgent")

LEADERSHIP_TERMS = ("appoint", "appointment", "joins as", "new chief", "new cmo", "new md")

RELATIONSHIP_EXISTING = ("crm", "existing", "known", "warm", "relationship")
RELATIONSHIP_PREVIOUS = ("previous client", "client", "candidate", "placed", "alumni")


def _contains_any(text: str, terms: Iterable[str]) -> bool:
    lowered = text.lower()
    return any(term in lowered for term in terms)


def _count_titles(text: str) -> int:
    lowered = text.lower()
    count = 0
    for title in RELEVANT_JOB_TITLES:
        if re.search(rf"\b{re.escape(title)}\b", lowered):
            count += 1
    return count


def _contact_name(contact: Dict[str, Any]) -> str:
    return " ".join(
        part for part in (contact.get("first_name", ""), contact.get("last_name", "")) if part
    ).strip()


def score_company(
    company: Dict[str, Any],
    signals: List[Dict[str, Any]],
    contacts: List[Dict[str, Any]],
) -> Dict[str, Any]:
    score = 0
    breakdown: List[Dict[str, Any]] = []

    def add(label: str, points: int, reason: str) -> None:
        nonlocal score
        score += points
        breakdown.append({"label": label, "points": points, "reason": reason})

    signal_text = " ".join(
        f"{signal.get('signal_title', '')} {signal.get('signal_text', '')} {signal.get('signal_type', '')}"
        for signal in signals
    )
    market_text = " ".join(
        [
            str(company.get("sector") or ""),
            str(company.get("location") or ""),
            signal_text,
        ]
    ).lower()

    if _contains_any(market_text, TARGET_SECTOR_KEYWORDS):
        add("Target sector match", 20, "Looks close to Essential Resourcing's agency, marketing or growth market.")
    else:
        add("Weak relevance", -20, "Sector signal is thin, so this needs a human sense-check.")

    if _contains_any(market_text, MANCHESTER_NW_TERMS):
        add("Manchester/North West location", 20, "The location sits in the core patch.")
    elif _contains_any(market_text, UK_RELEVANT_TERMS):
        add("UK-wide but relevant", 10, "Not local, but still plausible for senior marketing or agency work.")
    elif company.get("location"):
        add("Outside market", -30, "Location appears outside the current target market.")

    title_count = _count_titles(signal_text)
    if title_count:
        add("Senior marketing/digital/agency role found", 25, "Relevant hiring title found in the signal.")
    if title_count > 1 or len(signals) > 1:
        add("Multiple open roles found", 20, "Multiple signals suggest a bigger hiring need.")
    if _contains_any(signal_text, STALE_ROLE_TERMS):
        add("Role appears live/reposted/stale", 20, "The role may be dragging or urgent.")
    if _contains_any(signal_text, GROWTH_TERMS):
        add("Growth/funding/acquisition/client win signal", 20, "Growth news may create pressure to hire well.")
    if _contains_any(signal_text, LEADERSHIP_TERMS):
        add("Leadership move/new senior hire", 15, "Leadership change can create a useful reason to approach.")

    relationships = " ".join(str(contact.get("relationship_type") or "") for contact in contacts).lower()
    if _contains_any(relationships, RELATIONSHIP_EXISTING):
        add("Existing relationship from uploaded CRM", 30, "There is a warmer relationship marker in the contacts.")
    if _contains_any(relationships, RELATIONSHIP_PREVIOUS):
        add("Previous client or candidate connection", 40, "There is prior client or candidate context.")

    decision_maker = next(
        (
            contact
            for contact in contacts
            if _contains_any(str(contact.get("job_title") or ""), DECISION_MAKER_TITLES)
        ),
        None,
    )
    if decision_maker:
        add(
            "Hiring manager/decision-maker identified",
            15,
            f"Possible contact: {_contact_name(decision_maker) or decision_maker.get('job_title')}.",
        )
    else:
        add("No useful contact found", -10, "No obvious decision-maker is stored yet.")

    if signals:
        add("Clear reason to approach", 15, "There is a concrete signal to reference.")

    total = max(0, min(100, score))
    strongest_signal = signals[0] if signals else {}
    why = build_summary(company, strongest_signal, total, breakdown)
    suggested_action = build_suggested_action(total, decision_maker, strongest_signal)

    return {
        "company_id": company["id"],
        "total_score": total,
        "score_breakdown": breakdown,
        "ai_summary": why,
        "suggested_action": suggested_action,
    }


def build_summary(
    company: Dict[str, Any],
    signal: Dict[str, Any],
    total: int,
    breakdown: List[Dict[str, Any]],
) -> str:
    positive = [item for item in breakdown if item["points"] > 0]
    if positive:
        reason = positive[0]["reason"]
    else:
        reason = "The signal needs a manual review before any approach."
    signal_title = signal.get("signal_title") or "No strong signal stored yet"
    return f"{company['name']} scores {total}/100. {signal_title}. {reason}"


def build_suggested_action(
    total: int, decision_maker: Dict[str, Any], signal: Dict[str, Any]
) -> str:
    if total >= 80:
        return "Review today and draft a short, specific approach."
    if total >= 60:
        return "Sense-check the signal, then send a light-touch message if it holds up."
    if decision_maker and signal:
        return "Keep warm. Useful contact and signal, but not urgent yet."
    return "Do more research before contacting."


def score_all(db_path: str = None) -> int:
    initialize_database(db_path)
    scored = 0
    with connect(db_path) as conn:
        for company in list_companies(conn):
            result = score_company(
                company,
                list_signals(conn, company_id=company["id"]),
                list_contacts(conn, company_id=company["id"]),
            )
            insert_lead_score(conn, result)
            scored += 1
        conn.commit()
    return scored


def explain_breakdown(score_breakdown_json: str) -> List[Tuple[str, int, str]]:
    items = json.loads(score_breakdown_json or "[]")
    return [(item["label"], int(item["points"]), item["reason"]) for item in items]

