from __future__ import annotations

from pathlib import Path
from typing import Iterable, List, Optional

from .config import BASE_DIR
from .daily_digest import write_digest
from .ingest_gmail import import_gmail_alerts
from .ingest_rss import ingest_rss
from .ingest_search import run_search
from .monitor_careers import monitor_careers
from .scoring import score_all


def read_lines(path: Path) -> List[str]:
    if not path.exists():
        return []
    return [
        line.strip()
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.strip().startswith("#")
    ]


def run_daily(
    db_path: Optional[str] = None,
    search_queries_path: str = "data/search_queries.txt",
    rss_feeds_path: str = "data/rss_feeds.txt",
    careers_csv_path: str = "data/careers_pages.csv",
    digest_limit: int = 10,
) -> Path:
    search_queries = read_lines(BASE_DIR / search_queries_path)
    rss_feeds = read_lines(BASE_DIR / rss_feeds_path)

    if search_queries:
        run_search(search_queries, db_path=db_path, limit=5, sample_csv=None)

    for feed in rss_feeds:
        ingest_rss(feed, db_path=db_path)

    careers_csv = BASE_DIR / careers_csv_path
    if careers_csv.exists():
        monitor_careers(str(careers_csv), db_path=db_path)

    import_gmail_alerts(db_path=db_path)
    score_all(db_path=db_path)
    return write_digest(limit=digest_limit, db_path=db_path)

