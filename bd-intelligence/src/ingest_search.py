from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Dict, Iterable, List, Optional
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from .config import get_settings
from .database import connect, initialize_database, insert_signal, upsert_company
from .utils import clean_text, domain_to_company_name, normalize_url


DEFAULT_SEARCH_QUERIES = (
    "Marketing Director Manchester agency hiring",
    "Head of Performance Manchester agency job",
    "PR Account Director Manchester hiring",
    "Paid Media Director agency Manchester",
    "Digital agency Manchester careers",
    "CMO fractional marketing director hiring UK",
    "site:greenhouse.io marketing director Manchester",
    "site:lever.co marketing director Manchester",
    "site:workable.com marketing director Manchester",
    "site:ashbyhq.com marketing director Manchester",
)


def _fetch_json(url: str, headers: Optional[Dict[str, str]] = None) -> Dict[str, object]:
    request = Request(url, headers=headers or {"User-Agent": "EssentialResourcingBD/1.0"})
    with urlopen(request, timeout=25) as response:
        return json.loads(response.read().decode("utf-8"))


def search_serpapi(query: str, limit: int, db_path: Optional[str] = None) -> List[Dict[str, str]]:
    settings = get_settings(db_path)
    if not settings.serpapi_api_key:
        return []
    url = "https://serpapi.com/search.json?" + urlencode(
        {"engine": "google", "q": query, "num": limit, "api_key": settings.serpapi_api_key}
    )
    payload = _fetch_json(url)
    rows = []
    for item in payload.get("organic_results", [])[:limit]:
        link = clean_text(item.get("link"))
        rows.append(
            {
                "company_name": domain_to_company_name(link),
                "company_website": link,
                "title": clean_text(item.get("title")),
                "snippet": clean_text(item.get("snippet")),
                "url": link,
                "source": "serpapi",
            }
        )
    return rows


def search_google_cse(query: str, limit: int, db_path: Optional[str] = None) -> List[Dict[str, str]]:
    settings = get_settings(db_path)
    if not settings.google_cse_api_key or not settings.google_cse_id:
        return []
    url = "https://customsearch.googleapis.com/customsearch/v1?" + urlencode(
        {
            "key": settings.google_cse_api_key,
            "cx": settings.google_cse_id,
            "q": query,
            "num": min(limit, 10),
        }
    )
    payload = _fetch_json(url)
    rows = []
    for item in payload.get("items", [])[:limit]:
        link = clean_text(item.get("link"))
        rows.append(
            {
                "company_name": domain_to_company_name(link),
                "company_website": link,
                "title": clean_text(item.get("title")),
                "snippet": clean_text(item.get("snippet")),
                "url": link,
                "source": "google_cse",
            }
        )
    return rows


def search_bing(query: str, limit: int, db_path: Optional[str] = None) -> List[Dict[str, str]]:
    settings = get_settings(db_path)
    if not settings.bing_search_api_key:
        return []
    url = settings.bing_search_endpoint + "?" + urlencode({"q": query, "count": limit})
    payload = _fetch_json(url, headers={"Ocp-Apim-Subscription-Key": settings.bing_search_api_key})
    rows = []
    for item in payload.get("webPages", {}).get("value", [])[:limit]:
        link = clean_text(item.get("url"))
        rows.append(
            {
                "company_name": domain_to_company_name(link),
                "company_website": link,
                "title": clean_text(item.get("name")),
                "snippet": clean_text(item.get("snippet")),
                "url": link,
                "source": "bing",
            }
        )
    return rows


def read_sample_search_results(path: str) -> List[Dict[str, str]]:
    sample_path = Path(path)
    if not sample_path.exists():
        raise FileNotFoundError(f"Sample search CSV not found: {sample_path}")
    with sample_path.open(newline="", encoding="utf-8-sig") as handle:
        return [dict(row) for row in csv.DictReader(handle)]


def estimate_signal_type(title: str, snippet: str) -> str:
    text = f"{title} {snippet}".lower()
    if any(word in text for word in ("job", "hiring", "careers", "vacancy", "role")):
        return "hiring"
    if any(word in text for word in ("funding", "acquisition", "growth", "client win")):
        return "growth"
    if any(word in text for word in ("appoint", "appointment", "new hire", "joins")):
        return "leadership_move"
    return "news"


def ingest_search_results(results: Iterable[Dict[str, str]], db_path: Optional[str] = None) -> int:
    initialize_database(db_path)
    inserted = 0
    with connect(db_path) as conn:
        for row in results:
            url = normalize_url(row.get("url") or row.get("signal_url") or row.get("company_website") or "")
            company_id = upsert_company(
                conn,
                {
                    "name": row.get("company_name") or domain_to_company_name(url),
                    "website": row.get("company_website") or url,
                    "sector": row.get("sector", ""),
                    "location": row.get("location", ""),
                    "source": row.get("source", "search"),
                },
            )
            title = clean_text(row.get("title") or row.get("signal_title"))
            snippet = clean_text(row.get("snippet") or row.get("signal_text"))
            insert_signal(
                conn,
                {
                    "company_id": company_id,
                    "signal_type": row.get("signal_type") or estimate_signal_type(title, snippet),
                    "signal_title": title,
                    "signal_text": snippet,
                    "signal_url": url,
                    "source": row.get("source", "search"),
                    "relevance_score": row.get("relevance_score", 0),
                    "raw_data": row,
                },
            )
            inserted += 1
        conn.commit()
    return inserted


def run_search(
    queries: Optional[Iterable[str]] = None,
    db_path: Optional[str] = None,
    limit: int = 5,
    sample_csv: Optional[str] = None,
) -> int:
    all_results: List[Dict[str, str]] = []
    for query in queries or DEFAULT_SEARCH_QUERIES:
        google_results = search_google_cse(query, limit, db_path) or search_serpapi(
            query, limit, db_path
        )
        bing_results = search_bing(query, limit, db_path)
        all_results.extend(google_results)
        all_results.extend(bing_results)

    if not all_results and sample_csv:
        all_results = read_sample_search_results(sample_csv)

    return ingest_search_results(all_results, db_path)
