from __future__ import annotations

from typing import Mapping

from .utils import normalize_company_name, normalize_domain


def company_key(name: str, website: str = "") -> str:
    domain = normalize_domain(website)
    if domain:
        return f"domain:{domain}"
    return f"name:{normalize_company_name(name)}"


def company_matches(existing: Mapping[str, object], incoming: Mapping[str, object]) -> bool:
    existing_domain = normalize_domain(str(existing.get("website") or ""))
    incoming_domain = normalize_domain(str(incoming.get("website") or ""))
    if existing_domain and incoming_domain and existing_domain == incoming_domain:
        return True

    existing_name = normalize_company_name(str(existing.get("name") or ""))
    incoming_name = normalize_company_name(str(incoming.get("name") or ""))
    return bool(existing_name and incoming_name and existing_name == incoming_name)


def contact_key(
    company_id: int,
    first_name: str = "",
    last_name: str = "",
    email: str = "",
    linkedin_url: str = "",
) -> str:
    if email:
        return f"email:{email.strip().lower()}"
    if linkedin_url:
        return f"linkedin:{linkedin_url.strip().rstrip('/').lower()}"
    return (
        f"company:{company_id}:"
        f"{first_name.strip().lower()}:{last_name.strip().lower()}"
    )


def is_duplicate_contact(existing: Mapping[str, object], incoming: Mapping[str, object]) -> bool:
    existing_email = str(existing.get("email") or "").strip().lower()
    incoming_email = str(incoming.get("email") or "").strip().lower()
    if existing_email and incoming_email and existing_email == incoming_email:
        return True

    existing_linkedin = str(existing.get("linkedin_url") or "").strip().rstrip("/").lower()
    incoming_linkedin = str(incoming.get("linkedin_url") or "").strip().rstrip("/").lower()
    if existing_linkedin and incoming_linkedin and existing_linkedin == incoming_linkedin:
        return True

    return (
        int(existing.get("company_id") or 0) == int(incoming.get("company_id") or 0)
        and str(existing.get("first_name") or "").strip().lower()
        == str(incoming.get("first_name") or "").strip().lower()
        and str(existing.get("last_name") or "").strip().lower()
        == str(incoming.get("last_name") or "").strip().lower()
    )

