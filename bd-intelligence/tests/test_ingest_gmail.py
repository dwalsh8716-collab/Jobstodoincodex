from email.message import EmailMessage

from src.ingest_gmail import extract_job_mentions, parse_email_alert


def test_extract_job_mentions_from_linkedin_style_text() -> None:
    body = """
    Head of Performance
    North Star Digital
    Manchester
    View job
    """

    mentions = extract_job_mentions("New jobs for you", body)

    assert mentions[0]["title"] == "Head of Performance"
    assert mentions[0]["company_name"] == "North Star Digital"
    assert mentions[0]["location"] == "Manchester"


def test_parse_email_alert_falls_back_to_email_signal() -> None:
    message = EmailMessage()
    message["Subject"] = "LinkedIn jobs: Marketing Director Manchester"
    message["From"] = "jobs-noreply@linkedin.com"
    message["Message-ID"] = "<abc123@example.com>"
    message.set_content("New jobs for Marketing Director in Manchester")

    mentions = parse_email_alert(message.as_bytes())

    assert mentions[0]["company_name"] == "LinkedIn Job Alerts"
    assert mentions[0]["message_id"] == "<abc123@example.com>"
