from __future__ import annotations

import csv
import re
from html.parser import HTMLParser
from pathlib import Path
from typing import Dict, Iterable, List, Optional

from .database import (
    connect,
    initialize_database,
    insert_signal,
    insert_snapshot,
    latest_snapshot,
    upsert_company,
)
from .models import RELEVANT_JOB_TITLES
from .utils import clean_text, fetch_text, stable_hash


class HTMLTextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: List[str] = []
        self.skip = False

    def handle_starttag(self, tag: str, attrs: List[tuple]) -> None:
        if tag in {"script", "style", "noscript"}:
            self.skip = True

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "noscript"}:
            self.skip = False

    def handle_data(self, data: str) -> None:
        if not self.skip:
            self.parts.append(data)

    def text(self) -> str:
        return clean_text(" ".join(self.parts))


def html_to_text(html_text: str) -> str:
    parser = HTMLTextExtractor()
    parser.feed(html_text)
    return parser.text()


def detect_relevant_titles(text: str) -> List[str]:
    lowered = text.lower()
    found = []
    for title in RELEVANT_JOB_TITLES:
        if re.search(rf"\b{re.escape(title)}\b", lowered):
            found.append(title.title())
    return sorted(set(found))


def read_careers_targets(csv_path: str) -> List[Dict[str, str]]:
    path = Path(csv_path)
    if not path.exists():
        raise FileNotFoundError(f"Careers target CSV not found: {path}")
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return [dict(row) for row in csv.DictReader(handle)]


def monitor_targets(targets: Iterable[Dict[str, str]], db_path: Optional[str] = None) -> int:
    initialize_database(db_path)
    signals_created = 0
    with connect(db_path) as conn:
        for target in targets:
            source_url = target.get("careers_url") or target.get("url") or ""
            if not source_url:
                continue
            page_text = html_to_text(fetch_text(source_url))
            page_hash = stable_hash(page_text)
            previous = latest_snapshot(conn, source_url, "careers_page")
            titles = detect_relevant_titles(page_text)

            insert_snapshot(
                conn,
                {
                    "source_url": source_url,
                    "source_type": "careers_page",
                    "snapshot_text": page_text[:20000],
                    "snapshot_hash": page_hash,
                },
            )

            if previous and previous.get("snapshot_hash") == page_hash:
                continue

            if not titles:
                continue

            company_id = upsert_company(
                conn,
                {
                    "name": target.get("company_name") or target.get("company") or "Unknown company",
                    "website": target.get("website") or source_url,
                    "sector": target.get("sector", ""),
                    "location": target.get("location", ""),
                    "source": "careers_monitor",
                },
            )
            insert_signal(
                conn,
                {
                    "company_id": company_id,
                    "signal_type": "careers_page",
                    "signal_title": "Careers page showing relevant role(s)",
                    "signal_text": "Detected: " + ", ".join(titles),
                    "signal_url": source_url,
                    "source": "careers_monitor",
                    "raw_data": {"detected_titles": titles},
                },
            )
            signals_created += 1
        conn.commit()
    return signals_created


def monitor_careers(csv_path: str, db_path: Optional[str] = None) -> int:
    return monitor_targets(read_careers_targets(csv_path), db_path)

