from __future__ import annotations

import email
import imaplib
import re
from email.message import EmailMessage
from email.policy import default
from typing import Dict, Iterable, List, Optional

from .config import get_settings
from .database import connect, initialize_database, insert_signal, upsert_company
from .ingest_search import estimate_signal_type
from .models import RELEVANT_JOB_TITLES
from .utils import clean_text, utc_now_iso


GENERIC_LINES = {
    "view job",
    "apply",
    "jobs",
    "linkedin",
    "new jobs",
    "recommended jobs",
    "see more jobs",
}


def message_body(message: EmailMessage) -> str:
    if message.is_multipart():
        plain_parts = []
        html_parts = []
        for part in message.walk():
            content_type = part.get_content_type()
            disposition = part.get_content_disposition()
            if disposition == "attachment":
                continue
            if content_type == "text/plain":
                plain_parts.append(part.get_content())
            elif content_type == "text/html":
                html_parts.append(part.get_content())
        return clean_text("\n".join(plain_parts or html_parts))

    return clean_text(message.get_content())


def extract_links(text: str) -> List[str]:
    return re.findall(r"https?://[^\s)>\"']+", text)


def line_looks_like_title(line: str) -> bool:
    lowered = line.lower()
    return any(title in lowered for title in RELEVANT_JOB_TITLES)


def line_looks_like_company(line: str) -> bool:
    lowered = line.lower().strip()
    if not lowered or lowered in GENERIC_LINES:
        return False
    if "http" in lowered or "@" in lowered:
        return False
    if line_looks_like_title(line):
        return False
    return 2 <= len(line) <= 80


def extract_job_mentions(subject: str, body: str) -> List[Dict[str, str]]:
    lines = [clean_text(line) for line in re.split(r"[\r\n|•]+", body) if clean_text(line)]
    links = extract_links(body)
    mentions: List[Dict[str, str]] = []

    for index, line in enumerate(lines):
        if not line_looks_like_title(line):
            continue
        nearby = lines[index + 1 : index + 5]
        company = next((item for item in nearby if line_looks_like_company(item)), "")
        location = next(
            (
                item
                for item in nearby
                if any(place in item.lower() for place in ("manchester", "north west", "uk", "remote"))
            ),
            "",
        )
        mentions.append(
            {
                "company_name": company or "LinkedIn Job Alerts",
                "title": line,
                "snippet": "From LinkedIn/Gmail alert: " + subject,
                "url": links[0] if links else "",
                "location": location,
                "source": "gmail_linkedin_alert",
            }
        )

    if mentions:
        return mentions

    return [
        {
            "company_name": "LinkedIn Job Alerts",
            "title": subject,
            "snippet": body[:1000],
            "url": links[0] if links else "",
            "location": "",
            "source": "gmail_linkedin_alert",
        }
    ]


def parse_email_alert(raw_message: bytes) -> List[Dict[str, str]]:
    message = email.message_from_bytes(raw_message, policy=default)
    subject = clean_text(message.get("subject", "Gmail alert"))
    body = message_body(message)
    mentions = extract_job_mentions(subject, body)
    message_id = str(message.get("message-id", "")).strip() or f"gmail:{subject}:{utc_now_iso()}"
    for mention in mentions:
        mention["message_id"] = message_id
        mention["email_from"] = clean_text(message.get("from", ""))
        mention["email_date"] = clean_text(message.get("date", ""))
    return mentions


def _select_folder(mailbox: imaplib.IMAP4_SSL, folder: str) -> None:
    for candidate in (folder, f'"{folder}"'):
        status, _ = mailbox.select(candidate, readonly=True)
        if status == "OK":
            return
    raise RuntimeError(f"Could not open Gmail label/folder: {folder}")


def fetch_gmail_alerts(db_path: Optional[str] = None) -> List[Dict[str, str]]:
    settings = get_settings(db_path)
    if not settings.gmail_imap_email or not settings.gmail_app_password:
        return []

    with imaplib.IMAP4_SSL("imap.gmail.com") as mailbox:
        mailbox.login(settings.gmail_imap_email, settings.gmail_app_password)
        _select_folder(mailbox, settings.gmail_imap_folder)
        status, data = mailbox.search(None, settings.gmail_search_criteria)
        if status != "OK":
            return []

        message_ids = data[0].split()[-settings.gmail_max_emails :]
        rows: List[Dict[str, str]] = []
        for message_id in message_ids:
            status, fetched = mailbox.fetch(message_id, "(RFC822)")
            if status != "OK" or not fetched:
                continue
            raw = fetched[0][1]
            rows.extend(parse_email_alert(raw))
        return rows


def ingest_gmail_alerts(rows: Iterable[Dict[str, str]], db_path: Optional[str] = None) -> int:
    initialize_database(db_path)
    inserted = 0
    with connect(db_path) as conn:
        for row in rows:
            company_id = upsert_company(
                conn,
                {
                    "name": row.get("company_name") or "LinkedIn Job Alerts",
                    "location": row.get("location", ""),
                    "source": "gmail_linkedin_alert",
                },
            )
            title = row.get("title", "Gmail job alert")
            snippet = row.get("snippet", "")
            signal_url = row.get("url") or f"gmail:{row.get('message_id', title)}"
            insert_signal(
                conn,
                {
                    "company_id": company_id,
                    "signal_type": estimate_signal_type(title, snippet),
                    "signal_title": title,
                    "signal_text": snippet,
                    "signal_url": signal_url,
                    "source": "gmail_linkedin_alert",
                    "raw_data": row,
                },
            )
            inserted += 1
        conn.commit()
    return inserted


def import_gmail_alerts(db_path: Optional[str] = None) -> int:
    return ingest_gmail_alerts(fetch_gmail_alerts(db_path), db_path)
