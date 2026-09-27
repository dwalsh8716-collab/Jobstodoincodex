from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
EXPORTS_DIR = BASE_DIR / "exports"


def load_env_file(path: Optional[Path] = None) -> None:
    env_path = path or BASE_DIR / ".env"
    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


load_env_file()


@dataclass(frozen=True)
class Settings:
    db_path: Path
    openai_api_key: str
    openai_model: str
    serpapi_api_key: str
    google_cse_api_key: str
    google_cse_id: str
    bing_search_api_key: str
    bing_search_endpoint: str
    gmail_imap_email: str
    gmail_app_password: str
    gmail_imap_folder: str
    gmail_search_criteria: str
    gmail_max_emails: int


def get_settings(db_path: Optional[str] = None) -> Settings:
    resolved_db_path = Path(
        db_path or os.getenv("BD_DB_PATH", DATA_DIR / "bd_intelligence.sqlite3")
    )
    if not resolved_db_path.is_absolute():
        resolved_db_path = BASE_DIR / resolved_db_path

    return Settings(
        db_path=resolved_db_path,
        openai_api_key=os.getenv("OPENAI_API_KEY", ""),
        openai_model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
        serpapi_api_key=os.getenv("SERPAPI_API_KEY", ""),
        google_cse_api_key=os.getenv("GOOGLE_CSE_API_KEY", ""),
        google_cse_id=os.getenv("GOOGLE_CSE_ID", ""),
        bing_search_api_key=os.getenv("BING_SEARCH_API_KEY", ""),
        bing_search_endpoint=os.getenv(
            "BING_SEARCH_ENDPOINT", "https://api.bing.microsoft.com/v7.0/search"
        ),
        gmail_imap_email=os.getenv("GMAIL_IMAP_EMAIL", ""),
        gmail_app_password=os.getenv("GMAIL_APP_PASSWORD", ""),
        gmail_imap_folder=os.getenv("GMAIL_IMAP_FOLDER", "LinkedIn Job Alerts"),
        gmail_search_criteria=os.getenv("GMAIL_SEARCH_CRITERIA", "ALL"),
        gmail_max_emails=int(os.getenv("GMAIL_MAX_EMAILS", "25") or "25"),
    )
