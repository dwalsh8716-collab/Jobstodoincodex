from __future__ import annotations

import argparse
from pathlib import Path
from typing import Optional

from .config import BASE_DIR
from .daily_runner import run_daily
from .daily_digest import write_digest
from .database import connect, initialize_database, insert_interaction
from .ingest_csv import import_companies, import_contacts
from .ingest_gmail import import_gmail_alerts
from .ingest_rss import ingest_rss
from .ingest_search import DEFAULT_SEARCH_QUERIES, run_search
from .monitor_careers import monitor_careers
from .outreach_generator import generate_outreach
from .scoring import score_all


def _resolve(path: Optional[str]) -> Optional[str]:
    if not path:
        return None
    value = Path(path)
    if value.is_absolute():
        return str(value)
    return str(BASE_DIR / value)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Essential Resourcing signal-based BD intelligence MVP"
    )
    parser.add_argument("--db", help="SQLite database path. Defaults to BD_DB_PATH.")

    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("init-db", help="Initialise the SQLite database")

    companies = subparsers.add_parser("import-companies", help="Import companies from CSV")
    companies.add_argument("--csv", required=True)

    contacts = subparsers.add_parser("import-contacts", help="Import contacts from CSV")
    contacts.add_argument("--csv", required=True)

    search = subparsers.add_parser("run-search", help="Run hiring-signal search")
    search.add_argument("--query", action="append", help="Search query. Repeat for multiple.")
    search.add_argument("--limit", type=int, default=5)
    search.add_argument(
        "--sample",
        default="data/sample_search_results.csv",
        help="Fallback CSV used when no search API keys are present.",
    )

    rss = subparsers.add_parser("ingest-rss", help="Ingest one RSS feed URL")
    rss.add_argument("--feed", required=True)

    subparsers.add_parser("import-gmail-alerts", help="Import job alert emails from a Gmail label")

    careers = subparsers.add_parser("monitor-careers", help="Monitor careers pages from CSV")
    careers.add_argument("--csv", default="data/sample_careers_pages.csv")

    subparsers.add_parser("score-leads", help="Score every company")

    outreach = subparsers.add_parser("generate-outreach", help="Generate a draft message")
    outreach.add_argument("--company-id", type=int, required=True)
    outreach.add_argument("--contact-id", type=int)
    outreach.add_argument(
        "--channel",
        required=True,
        choices=[
            "linkedin_connection",
            "linkedin_sales_nav",
            "email",
            "follow_up",
            "call_opener",
        ],
    )
    outreach.add_argument("--message-type", default="first_touch")
    outreach.add_argument("--no-ai", action="store_true", help="Use the local fallback writer")

    digest = subparsers.add_parser("daily-digest", help="Write a plain text daily digest")
    digest.add_argument("--limit", type=int, default=10)
    digest.add_argument("--out", help="Output file path")

    daily = subparsers.add_parser("daily-run", help="Run the full scheduled morning workflow")
    daily.add_argument("--digest-limit", type=int, default=10)

    status = subparsers.add_parser("set-status", help="Record a company status")
    status.add_argument("--company-id", type=int, required=True)
    status.add_argument("--contact-id", type=int)
    status.add_argument("--status", required=True)
    status.add_argument("--notes", default="")
    status.add_argument("--follow-up-date", default="")

    demo = subparsers.add_parser("demo-load", help="Load sample companies, contacts and search signals")
    demo.add_argument("--score", action="store_true", help="Score leads after loading")

    return parser


def main(argv: Optional[list] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    db_path = args.db

    if args.command == "init-db":
        path = initialize_database(db_path)
        print(f"Database ready: {path}")
        return 0

    if args.command == "import-companies":
        count = import_companies(_resolve(args.csv), db_path)
        print(f"Imported or updated {count} companies")
        return 0

    if args.command == "import-contacts":
        count = import_contacts(_resolve(args.csv), db_path)
        print(f"Imported or updated {count} contacts")
        return 0

    if args.command == "run-search":
        queries = args.query or DEFAULT_SEARCH_QUERIES
        count = run_search(queries, db_path=db_path, limit=args.limit, sample_csv=_resolve(args.sample))
        print(f"Stored {count} search signal rows")
        return 0

    if args.command == "ingest-rss":
        count = ingest_rss(args.feed, db_path)
        print(f"Stored {count} RSS signal rows")
        return 0

    if args.command == "import-gmail-alerts":
        count = import_gmail_alerts(db_path)
        print(f"Stored {count} Gmail alert signal rows")
        return 0

    if args.command == "monitor-careers":
        count = monitor_careers(_resolve(args.csv), db_path)
        print(f"Created {count} careers-page signal rows")
        return 0

    if args.command == "score-leads":
        count = score_all(db_path)
        print(f"Scored {count} companies")
        return 0

    if args.command == "generate-outreach":
        message = generate_outreach(
            company_id=args.company_id,
            contact_id=args.contact_id,
            channel=args.channel,
            message_type=args.message_type,
            use_ai=not args.no_ai,
            db_path=db_path,
        )
        if message.get("subject_line"):
            print(f"Subject: {message['subject_line']}")
        print(message["body"])
        print(f"\nDraft saved as outreach_messages.id={message['id']}")
        return 0

    if args.command == "daily-digest":
        path = write_digest(args.out, limit=args.limit, db_path=db_path)
        print(f"Digest written: {path}")
        return 0

    if args.command == "daily-run":
        path = run_daily(db_path=db_path, digest_limit=args.digest_limit)
        print(f"Daily run complete. Digest written: {path}")
        return 0

    if args.command == "set-status":
        initialize_database(db_path)
        with connect(db_path) as conn:
            insert_interaction(
                conn,
                {
                    "company_id": args.company_id,
                    "contact_id": args.contact_id,
                    "status": args.status,
                    "notes": args.notes,
                    "follow_up_date": args.follow_up_date,
                },
            )
            conn.commit()
        print(f"Status recorded for company {args.company_id}: {args.status}")
        return 0

    if args.command == "demo-load":
        import_companies(_resolve("data/sample_companies.csv"), db_path)
        import_contacts(_resolve("data/sample_contacts.csv"), db_path)
        run_search(
            DEFAULT_SEARCH_QUERIES[:2],
            db_path=db_path,
            limit=5,
            sample_csv=_resolve("data/sample_search_results.csv"),
        )
        monitor_careers(_resolve("data/sample_careers_pages.csv"), db_path)
        if args.score:
            score_all(db_path)
        print("Demo data loaded")
        return 0

    parser.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
