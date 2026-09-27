from src.dedupe import company_key, company_matches, contact_key, is_duplicate_contact


def test_company_key_prefers_domain() -> None:
    assert company_key("North Star Digital Ltd", "https://www.northstar.example") == (
        "domain:northstar.example"
    )


def test_company_matches_normalised_names() -> None:
    existing = {"name": "North Star Digital Ltd", "website": ""}
    incoming = {"name": "North Star Digital", "website": ""}
    assert company_matches(existing, incoming)


def test_contact_email_dedupe() -> None:
    existing = {"company_id": 1, "first_name": "Sarah", "last_name": "Turner", "email": "SARAH@example.com"}
    incoming = {"company_id": 2, "first_name": "S", "last_name": "Turner", "email": "sarah@example.com"}
    assert is_duplicate_contact(existing, incoming)


def test_contact_key_falls_back_to_name() -> None:
    assert contact_key(7, first_name="Tom", last_name="Hughes") == "company:7:tom:hughes"

