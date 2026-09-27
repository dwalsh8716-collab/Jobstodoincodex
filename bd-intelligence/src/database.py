from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any, Dict, Iterable, List, Mapping, Optional

from .config import get_settings
from .dedupe import company_matches, is_duplicate_contact
from .utils import clean_text, normalize_url, row_to_dict, utc_now_iso


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    website TEXT,
    sector TEXT,
    location TEXT,
    linkedin_url TEXT,
    source TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    first_name TEXT,
    last_name TEXT,
    job_title TEXT,
    email TEXT,
    linkedin_url TEXT,
    relationship_type TEXT,
    source TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    signal_type TEXT NOT NULL,
    signal_title TEXT NOT NULL,
    signal_text TEXT,
    signal_url TEXT,
    source TEXT,
    detected_at TEXT NOT NULL,
    relevance_score INTEGER DEFAULT 0,
    raw_data TEXT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lead_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    total_score INTEGER NOT NULL,
    score_breakdown_json TEXT NOT NULL,
    ai_summary TEXT,
    suggested_action TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS outreach_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    contact_id INTEGER,
    channel TEXT NOT NULL,
    message_type TEXT NOT NULL,
    subject_line TEXT,
    body TEXT NOT NULL,
    tone TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    contact_id INTEGER,
    interaction_type TEXT NOT NULL,
    notes TEXT,
    status TEXT,
    follow_up_date TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS source_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_url TEXT NOT NULL,
    source_type TEXT NOT NULL,
    snapshot_text TEXT,
    snapshot_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_signals_company ON signals(company_id);
CREATE INDEX IF NOT EXISTS idx_scores_company_created ON lead_scores(company_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_company ON outreach_messages(company_id);
CREATE INDEX IF NOT EXISTS idx_interactions_company ON interactions(company_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_source ON source_snapshots(source_url, source_type, created_at);
"""


def connect(db_path: Optional[str] = None) -> sqlite3.Connection:
    settings = get_settings(db_path)
    settings.db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(settings.db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def initialize_database(db_path: Optional[str] = None) -> Path:
    settings = get_settings(db_path)
    with connect(str(settings.db_path)) as conn:
        conn.executescript(SCHEMA_SQL)
    return settings.db_path


def _first_non_empty(*values: Any) -> str:
    for value in values:
        text = clean_text(value)
        if text:
            return text
    return ""


def _merge(existing: Mapping[str, Any], incoming: Dict[str, Any], fields: Iterable[str]) -> Dict[str, Any]:
    merged: Dict[str, Any] = {}
    for field in fields:
        incoming_value = incoming.get(field)
        merged[field] = clean_text(incoming_value) or existing[field]
    return merged


def list_companies(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    return [row_to_dict(row) for row in conn.execute("SELECT * FROM companies ORDER BY name")]


def find_company(
    conn: sqlite3.Connection, name: str = "", website: str = ""
) -> Optional[Dict[str, Any]]:
    incoming = {"name": name, "website": website}
    for row in conn.execute("SELECT * FROM companies"):
        data = row_to_dict(row)
        if company_matches(data, incoming):
            return data
    return None


def upsert_company(conn: sqlite3.Connection, data: Dict[str, Any]) -> int:
    now = utc_now_iso()
    name = _first_non_empty(data.get("name"), data.get("company"), data.get("company_name"))
    if not name:
        raise ValueError("Company name is required")

    incoming = {
        "name": name,
        "website": normalize_url(_first_non_empty(data.get("website"), data.get("domain"))),
        "sector": _first_non_empty(data.get("sector"), data.get("industry")),
        "location": _first_non_empty(data.get("location"), data.get("city")),
        "linkedin_url": normalize_url(
            _first_non_empty(data.get("linkedin_url"), data.get("company_linkedin"))
        ),
        "source": _first_non_empty(data.get("source"), "manual"),
    }

    existing = find_company(conn, incoming["name"], incoming["website"])
    if existing:
        merged = _merge(existing, incoming, incoming.keys())
        conn.execute(
            """
            UPDATE companies
            SET name = ?, website = ?, sector = ?, location = ?, linkedin_url = ?,
                source = ?, updated_at = ?
            WHERE id = ?
            """,
            (
                merged["name"],
                merged["website"],
                merged["sector"],
                merged["location"],
                merged["linkedin_url"],
                merged["source"],
                now,
                existing["id"],
            ),
        )
        return int(existing["id"])

    cursor = conn.execute(
        """
        INSERT INTO companies
            (name, website, sector, location, linkedin_url, source, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            incoming["name"],
            incoming["website"],
            incoming["sector"],
            incoming["location"],
            incoming["linkedin_url"],
            incoming["source"],
            now,
            now,
        ),
    )
    return int(cursor.lastrowid)


def list_contacts(conn: sqlite3.Connection, company_id: Optional[int] = None) -> List[Dict[str, Any]]:
    if company_id:
        rows = conn.execute(
            "SELECT * FROM contacts WHERE company_id = ? ORDER BY last_name, first_name",
            (company_id,),
        )
    else:
        rows = conn.execute("SELECT * FROM contacts ORDER BY last_name, first_name")
    return [row_to_dict(row) for row in rows]


def upsert_contact(conn: sqlite3.Connection, data: Dict[str, Any]) -> int:
    now = utc_now_iso()
    company_id = int(data.get("company_id") or 0)
    if not company_id:
        company_name = _first_non_empty(data.get("company_name"), data.get("company"))
        company_id = upsert_company(
            conn,
            {
                "name": company_name,
                "website": data.get("company_website", ""),
                "sector": data.get("sector", ""),
                "location": data.get("location", ""),
                "source": data.get("source", "contact_import"),
            },
        )

    incoming = {
        "company_id": company_id,
        "first_name": _first_non_empty(data.get("first_name"), data.get("firstname")),
        "last_name": _first_non_empty(data.get("last_name"), data.get("lastname")),
        "job_title": _first_non_empty(data.get("job_title"), data.get("title")),
        "email": _first_non_empty(data.get("email"), data.get("email_address")).lower(),
        "linkedin_url": normalize_url(_first_non_empty(data.get("linkedin_url"), data.get("linkedin"))),
        "relationship_type": _first_non_empty(
            data.get("relationship_type"), data.get("relationship"), "unknown"
        ),
        "source": _first_non_empty(data.get("source"), "manual"),
    }

    for existing in list_contacts(conn, company_id=company_id):
        if is_duplicate_contact(existing, incoming):
            merged = {field: incoming.get(field) or existing.get(field) for field in incoming}
            conn.execute(
                """
                UPDATE contacts
                SET first_name = ?, last_name = ?, job_title = ?, email = ?,
                    linkedin_url = ?, relationship_type = ?, source = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    merged["first_name"],
                    merged["last_name"],
                    merged["job_title"],
                    merged["email"],
                    merged["linkedin_url"],
                    merged["relationship_type"],
                    merged["source"],
                    now,
                    existing["id"],
                ),
            )
            return int(existing["id"])

    cursor = conn.execute(
        """
        INSERT INTO contacts
            (company_id, first_name, last_name, job_title, email, linkedin_url,
             relationship_type, source, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            incoming["company_id"],
            incoming["first_name"],
            incoming["last_name"],
            incoming["job_title"],
            incoming["email"],
            incoming["linkedin_url"],
            incoming["relationship_type"],
            incoming["source"],
            now,
            now,
        ),
    )
    return int(cursor.lastrowid)


def insert_signal(conn: sqlite3.Connection, data: Dict[str, Any]) -> int:
    now = utc_now_iso()
    company_id = int(data["company_id"])
    title = clean_text(data.get("signal_title") or data.get("title"))
    url = normalize_url(clean_text(data.get("signal_url") or data.get("url")))

    existing = conn.execute(
        """
        SELECT id FROM signals
        WHERE company_id = ?
          AND lower(signal_title) = lower(?)
          AND coalesce(signal_url, '') = ?
        """,
        (company_id, title, url),
    ).fetchone()
    if existing:
        return int(existing["id"])

    cursor = conn.execute(
        """
        INSERT INTO signals
            (company_id, signal_type, signal_title, signal_text, signal_url,
             source, detected_at, relevance_score, raw_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            company_id,
            clean_text(data.get("signal_type") or "unknown"),
            title,
            clean_text(data.get("signal_text") or data.get("snippet")),
            url,
            clean_text(data.get("source") or "manual"),
            clean_text(data.get("detected_at") or now),
            int(data.get("relevance_score") or 0),
            json.dumps(data.get("raw_data") or {}, ensure_ascii=True),
        ),
    )
    return int(cursor.lastrowid)


def list_signals(conn: sqlite3.Connection, company_id: Optional[int] = None) -> List[Dict[str, Any]]:
    if company_id:
        rows = conn.execute(
            "SELECT * FROM signals WHERE company_id = ? ORDER BY detected_at DESC",
            (company_id,),
        )
    else:
        rows = conn.execute("SELECT * FROM signals ORDER BY detected_at DESC")
    return [row_to_dict(row) for row in rows]


def insert_lead_score(conn: sqlite3.Connection, data: Dict[str, Any]) -> int:
    cursor = conn.execute(
        """
        INSERT INTO lead_scores
            (company_id, total_score, score_breakdown_json, ai_summary,
             suggested_action, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            int(data["company_id"]),
            int(data["total_score"]),
            json.dumps(data["score_breakdown"], ensure_ascii=True),
            clean_text(data.get("ai_summary")),
            clean_text(data.get("suggested_action")),
            clean_text(data.get("created_at") or utc_now_iso()),
        ),
    )
    return int(cursor.lastrowid)


def insert_outreach_message(conn: sqlite3.Connection, data: Dict[str, Any]) -> int:
    now = utc_now_iso()
    cursor = conn.execute(
        """
        INSERT INTO outreach_messages
            (company_id, contact_id, channel, message_type, subject_line, body,
             tone, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            int(data["company_id"]),
            data.get("contact_id"),
            clean_text(data["channel"]),
            clean_text(data.get("message_type") or "first_touch"),
            clean_text(data.get("subject_line")),
            data["body"].strip(),
            clean_text(data.get("tone") or "David Walsh"),
            clean_text(data.get("status") or "Draft"),
            now,
            now,
        ),
    )
    return int(cursor.lastrowid)


def insert_interaction(conn: sqlite3.Connection, data: Dict[str, Any]) -> int:
    cursor = conn.execute(
        """
        INSERT INTO interactions
            (company_id, contact_id, interaction_type, notes, status,
             follow_up_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            int(data["company_id"]),
            data.get("contact_id"),
            clean_text(data.get("interaction_type") or "status_update"),
            clean_text(data.get("notes")),
            clean_text(data.get("status")),
            clean_text(data.get("follow_up_date")),
            utc_now_iso(),
        ),
    )
    return int(cursor.lastrowid)


def latest_snapshot(
    conn: sqlite3.Connection, source_url: str, source_type: str
) -> Optional[Dict[str, Any]]:
    row = conn.execute(
        """
        SELECT * FROM source_snapshots
        WHERE source_url = ? AND source_type = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 1
        """,
        (source_url, source_type),
    ).fetchone()
    return row_to_dict(row) if row else None


def insert_snapshot(conn: sqlite3.Connection, data: Dict[str, Any]) -> int:
    cursor = conn.execute(
        """
        INSERT INTO source_snapshots
            (source_url, source_type, snapshot_text, snapshot_hash, created_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            clean_text(data["source_url"]),
            clean_text(data["source_type"]),
            clean_text(data.get("snapshot_text")),
            clean_text(data["snapshot_hash"]),
            utc_now_iso(),
        ),
    )
    return int(cursor.lastrowid)


def get_company_bundle(conn: sqlite3.Connection, company_id: int) -> Dict[str, Any]:
    company = conn.execute("SELECT * FROM companies WHERE id = ?", (company_id,)).fetchone()
    if not company:
        raise ValueError(f"No company found for id {company_id}")

    latest_score = conn.execute(
        """
        SELECT * FROM lead_scores
        WHERE company_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 1
        """,
        (company_id,),
    ).fetchone()

    return {
        "company": row_to_dict(company),
        "contacts": list_contacts(conn, company_id),
        "signals": list_signals(conn, company_id),
        "latest_score": row_to_dict(latest_score) if latest_score else None,
    }


def get_latest_outreach(
    conn: sqlite3.Connection, company_id: int, channel: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    params: List[Any] = [company_id]
    channel_clause = ""
    if channel:
        channel_clause = "AND channel = ?"
        params.append(channel)

    row = conn.execute(
        f"""
        SELECT * FROM outreach_messages
        WHERE company_id = ? {channel_clause}
        ORDER BY created_at DESC, id DESC
        LIMIT 1
        """,
        params,
    ).fetchone()
    return row_to_dict(row) if row else None


def get_top_leads(
    conn: sqlite3.Connection,
    limit: int = 10,
    min_score: int = 0,
    sector: str = "",
    location: str = "",
    status: str = "",
) -> List[Dict[str, Any]]:
    params: List[Any] = [min_score]
    filters = ["latest_score.total_score >= ?"]
    if sector:
        filters.append("lower(companies.sector) LIKE ?")
        params.append(f"%{sector.lower()}%")
    if location:
        filters.append("lower(companies.location) LIKE ?")
        params.append(f"%{location.lower()}%")
    if status:
        filters.append("coalesce(latest_interaction.status, 'New') = ?")
        params.append(status)
    params.append(limit)

    rows = conn.execute(
        f"""
        WITH latest_score_ids AS (
            SELECT company_id, max(id) AS score_id
            FROM lead_scores
            GROUP BY company_id
        ),
        latest_signal_ids AS (
            SELECT company_id, max(id) AS signal_id
            FROM signals
            GROUP BY company_id
        ),
        latest_interaction_ids AS (
            SELECT company_id, max(id) AS interaction_id
            FROM interactions
            GROUP BY company_id
        )
        SELECT
            companies.*,
            latest_score.total_score,
            latest_score.score_breakdown_json,
            latest_score.ai_summary,
            latest_score.suggested_action,
            latest_signal.signal_title,
            latest_signal.signal_text,
            latest_signal.signal_url,
            latest_signal.signal_type,
            latest_interaction.status AS current_status,
            latest_interaction.follow_up_date
        FROM companies
        JOIN latest_score_ids ON latest_score_ids.company_id = companies.id
        JOIN lead_scores latest_score ON latest_score.id = latest_score_ids.score_id
        LEFT JOIN latest_signal_ids ON latest_signal_ids.company_id = companies.id
        LEFT JOIN signals latest_signal ON latest_signal.id = latest_signal_ids.signal_id
        LEFT JOIN latest_interaction_ids ON latest_interaction_ids.company_id = companies.id
        LEFT JOIN interactions latest_interaction
            ON latest_interaction.id = latest_interaction_ids.interaction_id
        WHERE {" AND ".join(filters)}
        ORDER BY latest_score.total_score DESC, latest_score.created_at DESC
        LIMIT ?
        """,
        params,
    )
    return [row_to_dict(row) for row in rows]


def due_follow_ups(conn: sqlite3.Connection, today: str) -> List[Dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT companies.name, contacts.first_name, contacts.last_name,
               interactions.follow_up_date, interactions.notes, interactions.status
        FROM interactions
        JOIN companies ON companies.id = interactions.company_id
        LEFT JOIN contacts ON contacts.id = interactions.contact_id
        WHERE interactions.follow_up_date IS NOT NULL
          AND interactions.follow_up_date != ''
          AND interactions.follow_up_date <= ?
          AND coalesce(interactions.status, '') != 'Not relevant'
        ORDER BY interactions.follow_up_date ASC
        """,
        (today,),
    )
    return [row_to_dict(row) for row in rows]
