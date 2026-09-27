from __future__ import annotations

import csv
from pathlib import Path
from typing import Dict, Iterable, List, Optional

from .database import connect, initialize_database, upsert_company, upsert_contact


def _read_csv(path: str) -> List[Dict[str, str]]:
    csv_path = Path(path)
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")
    with csv_path.open(newline="", encoding="utf-8-sig") as handle:
        return [dict(row) for row in csv.DictReader(handle)]


def _pick(row: Dict[str, str], *keys: str) -> str:
    lowered = {key.strip().lower(): value for key, value in row.items()}
    for key in keys:
        value = lowered.get(key.lower())
        if value:
            return value.strip()
    return ""


def import_companies(csv_path: str, db_path: Optional[str] = None) -> int:
    initialize_database(db_path)
    rows = _read_csv(csv_path)
    count = 0
    with connect(db_path) as conn:
        for row in rows:
            upsert_company(
                conn,
                {
                    "name": _pick(row, "name", "company", "company_name", "account name"),
                    "website": _pick(row, "website", "domain", "company_website"),
                    "sector": _pick(row, "sector", "industry"),
                    "location": _pick(row, "location", "city", "region"),
                    "linkedin_url": _pick(row, "linkedin_url", "company_linkedin", "linkedin"),
                    "source": _pick(row, "source") or Path(csv_path).name,
                },
            )
            count += 1
        conn.commit()
    return count


def import_contacts(csv_path: str, db_path: Optional[str] = None) -> int:
    initialize_database(db_path)
    rows = _read_csv(csv_path)
    count = 0
    with connect(db_path) as conn:
        for row in rows:
            company_id = upsert_company(
                conn,
                {
                    "name": _pick(row, "company_name", "company", "account name"),
                    "website": _pick(row, "company_website", "website", "domain"),
                    "sector": _pick(row, "sector", "industry"),
                    "location": _pick(row, "location", "city", "region"),
                    "source": _pick(row, "source") or Path(csv_path).name,
                },
            )
            upsert_contact(
                conn,
                {
                    "company_id": company_id,
                    "first_name": _pick(row, "first_name", "first name", "firstname"),
                    "last_name": _pick(row, "last_name", "last name", "lastname", "surname"),
                    "job_title": _pick(row, "job_title", "title", "position"),
                    "email": _pick(row, "email", "email_address", "email address"),
                    "linkedin_url": _pick(row, "linkedin_url", "linkedin", "profile url"),
                    "relationship_type": _pick(
                        row, "relationship_type", "relationship", "relationship type"
                    ),
                    "source": _pick(row, "source") or Path(csv_path).name,
                },
            )
            count += 1
        conn.commit()
    return count


def import_csvs(paths: Iterable[str], db_path: Optional[str] = None) -> int:
    total = 0
    for path in paths:
        total += import_companies(path, db_path)
    return total

