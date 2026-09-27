from __future__ import annotations

import hashlib
import html
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from .config import BASE_DIR


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def today_slug() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def clean_text(value: Any) -> str:
    if value is None:
        return ""
    text = html.unescape(str(value))
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def normalize_company_name(name: str) -> str:
    text = clean_text(name).lower()
    text = re.sub(r"&", " and ", text)
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    words = [
        word
        for word in text.split()
        if word
        not in {
            "ltd",
            "limited",
            "plc",
            "llp",
            "agency",
            "group",
            "the",
            "uk",
            "co",
        }
    ]
    return " ".join(words)


def normalize_url(url: str) -> str:
    if not url:
        return ""
    value = url.strip()
    if value.startswith(("gmail:", "mailto:", "urn:")):
        return value
    if value and "://" not in value and not value.startswith("data/"):
        value = "https://" + value
    return value.rstrip("/")


def normalize_domain(url: str) -> str:
    if not url:
        return ""
    parsed = urlparse(normalize_url(url))
    host = (parsed.netloc or parsed.path).lower()
    return host.removeprefix("www.").split("/")[0]


def stable_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def row_to_dict(row: Any) -> Dict[str, Any]:
    return dict(row) if row is not None else {}


def fetch_text(url_or_path: str, timeout: int = 20) -> str:
    value = url_or_path.strip()
    local_path = Path(value)
    if not local_path.is_absolute():
        local_path = BASE_DIR / local_path
    if local_path.exists():
        return local_path.read_text(encoding="utf-8", errors="ignore")

    request = Request(
        value,
        headers={
            "User-Agent": (
                "EssentialResourcingBD/1.0 "
                "(human-in-the-loop recruitment intelligence)"
            )
        },
    )
    with urlopen(request, timeout=timeout) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(charset, errors="ignore")


def domain_to_company_name(url: str) -> str:
    domain = normalize_domain(url)
    if not domain:
        return "Unknown company"
    stem = domain.split(".")[0]
    return " ".join(part.capitalize() for part in re.split(r"[-_]+", stem) if part)
