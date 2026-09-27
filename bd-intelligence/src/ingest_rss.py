from __future__ import annotations

import xml.etree.ElementTree as ET
from typing import Dict, List, Optional

from .database import connect, initialize_database, insert_signal, upsert_company
from .ingest_search import estimate_signal_type
from .utils import clean_text, domain_to_company_name, fetch_text, normalize_url


def parse_rss(xml_text: str) -> List[Dict[str, str]]:
    root = ET.fromstring(xml_text)
    items = root.findall(".//item")
    if not items:
        items = root.findall(".//{http://www.w3.org/2005/Atom}entry")

    parsed: List[Dict[str, str]] = []
    for item in items:
        title = clean_text(item.findtext("title") or item.findtext("{http://www.w3.org/2005/Atom}title"))
        description = clean_text(
            item.findtext("description")
            or item.findtext("summary")
            or item.findtext("{http://www.w3.org/2005/Atom}summary")
        )
        link = clean_text(item.findtext("link") or "")
        if not link:
            atom_link = item.find("{http://www.w3.org/2005/Atom}link")
            link = clean_text(atom_link.attrib.get("href", "") if atom_link is not None else "")
        parsed.append({"title": title, "snippet": description, "url": link})
    return parsed


def ingest_rss(feed_url: str, db_path: Optional[str] = None) -> int:
    initialize_database(db_path)
    rows = parse_rss(fetch_text(feed_url))
    inserted = 0
    with connect(db_path) as conn:
        for row in rows:
            url = normalize_url(row.get("url", ""))
            company_id = upsert_company(
                conn,
                {
                    "name": domain_to_company_name(url) if url else "News signal",
                    "website": url,
                    "source": feed_url,
                },
            )
            title = row["title"]
            snippet = row["snippet"]
            insert_signal(
                conn,
                {
                    "company_id": company_id,
                    "signal_type": estimate_signal_type(title, snippet),
                    "signal_title": title,
                    "signal_text": snippet,
                    "signal_url": url,
                    "source": feed_url,
                    "raw_data": row,
                },
            )
            inserted += 1
        conn.commit()
    return inserted

