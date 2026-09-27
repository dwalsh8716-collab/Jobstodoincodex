from __future__ import annotations

from pathlib import Path
from typing import List, Optional

from .config import EXPORTS_DIR
from .database import connect, due_follow_ups, get_latest_outreach, get_top_leads, list_signals
from .utils import today_slug


def build_digest(limit: int = 10, db_path: Optional[str] = None) -> str:
    today = today_slug()
    with connect(db_path) as conn:
        leads = get_top_leads(conn, limit=limit)
        signals = list_signals(conn)[:20]
        follow_ups = due_follow_ups(conn, today)

        lines: List[str] = [
            f"Essential Resourcing BD Digest - {today}",
            "",
            "Top leads",
        ]
        if not leads:
            lines.append("No scored leads yet. Import data, run signals, then score leads.")
        for index, lead in enumerate(leads, start=1):
            latest_message = get_latest_outreach(conn, lead["id"])
            lines.extend(
                [
                    "",
                    f"{index}. {lead['name']} - {lead['total_score']}/100",
                    f"Signal: {lead.get('signal_title') or 'No signal stored'}",
                    f"Why it matters: {lead.get('ai_summary') or 'Needs review'}",
                    f"Next action: {lead.get('suggested_action') or 'Review'}",
                ]
            )
            if latest_message:
                if latest_message.get("subject_line"):
                    lines.append(f"Suggested subject: {latest_message['subject_line']}")
                lines.append("Suggested message:")
                lines.append(latest_message["body"])

        lines.extend(["", "New signals found"])
        if not signals:
            lines.append("No signals stored yet.")
        for signal in signals[:10]:
            lines.append(f"- {signal['signal_title']} ({signal['source']})")

        lines.extend(["", "Follow-up reminders"])
        if not follow_ups:
            lines.append("No follow-ups due today.")
        for follow_up in follow_ups:
            contact = " ".join(
                part
                for part in (follow_up.get("first_name", ""), follow_up.get("last_name", ""))
                if part
            ).strip()
            who = f"{follow_up['name']} / {contact}" if contact else follow_up["name"]
            lines.append(f"- {who}: {follow_up.get('notes') or follow_up.get('status') or 'Follow up'}")

    return "\n".join(lines).strip() + "\n"


def write_digest(output_path: Optional[str] = None, limit: int = 10, db_path: Optional[str] = None) -> Path:
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
    path = Path(output_path) if output_path else EXPORTS_DIR / f"daily_digest_{today_slug()}.txt"
    if not path.is_absolute():
        path = EXPORTS_DIR.parent / path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(build_digest(limit=limit, db_path=db_path), encoding="utf-8")
    return path

