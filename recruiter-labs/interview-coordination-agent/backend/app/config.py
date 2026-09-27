from dataclasses import dataclass
import os
from pathlib import Path
from typing import Tuple


def _default_database_url() -> str:
    data_dir = Path(__file__).resolve().parents[1] / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    return "sqlite:///" + str(data_dir / "interview_agent.db")


def _parse_time(value: str, fallback: str) -> str:
    parts = (value or fallback).split(":")
    if len(parts) != 2:
        return fallback
    hour, minute = parts
    if not (hour.isdigit() and minute.isdigit()):
        return fallback
    if not (0 <= int(hour) <= 23 and 0 <= int(minute) <= 59):
        return fallback
    return f"{int(hour):02d}:{int(minute):02d}"


@dataclass(frozen=True)
class Settings:
    app_env: str
    app_base_url: str
    api_base_url: str
    database_url: str
    redis_url: str
    login_email: str
    login_password: str
    session_secret: str
    default_timezone: str
    working_hours_start: str
    working_hours_end: str
    default_interview_start: str
    default_interview_end: str
    max_automated_chases: int
    ai_confidence_threshold: float
    email_provider: str
    calendar_provider: str
    crm_connector: str
    enable_gmail_reply_sync: bool
    smtp_host: str
    smtp_port: int
    smtp_username: str
    smtp_password: str
    smtp_from_email: str
    smtp_from_name: str
    smtp_use_tls: bool
    smtp_use_ssl: bool
    google_oauth_client_id: str
    google_oauth_client_secret: str
    google_oauth_redirect_uri: str
    google_oauth_hosted_domain: str
    google_oauth_login_hint: str
    google_calendar_id: str
    check_recruiter_calendar_conflicts: bool
    enable_automation_worker: bool
    worker_due_work_interval_seconds: int
    worker_gmail_sync_interval_seconds: int
    login_rate_limit_attempts: int
    public_rate_limit_attempts: int

    @property
    def auth_configured(self) -> bool:
        return bool(self.login_email and self.login_password and self.session_secret)

    @property
    def scheduling_hours(self) -> Tuple[str, str]:
        return self.default_interview_start, self.default_interview_end

    @property
    def smtp_configured(self) -> bool:
        return bool(self.smtp_host and self.smtp_port and self.smtp_username and self.smtp_password and self.smtp_from_email)

    @property
    def google_oauth_configured(self) -> bool:
        return bool(self.google_oauth_client_id and self.google_oauth_client_secret and self.google_oauth_redirect_uri)


def get_settings() -> Settings:
    return Settings(
        app_env=os.getenv("APP_ENV", "development"),
        app_base_url=os.getenv("APP_BASE_URL", "http://localhost:3005"),
        api_base_url=os.getenv("API_BASE_URL", "http://localhost:8005"),
        database_url=os.getenv("DATABASE_URL", _default_database_url()),
        redis_url=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
        login_email=os.getenv("APP_LOGIN_EMAIL", ""),
        login_password=os.getenv("APP_LOGIN_PASSWORD", ""),
        session_secret=os.getenv("SESSION_SECRET", ""),
        default_timezone=os.getenv("DEFAULT_TIMEZONE", "Europe/London"),
        working_hours_start=_parse_time(os.getenv("WORKING_HOURS_START", ""), "08:00"),
        working_hours_end=_parse_time(os.getenv("WORKING_HOURS_END", ""), "18:00"),
        default_interview_start=_parse_time(
            os.getenv("DEFAULT_INTERVIEW_START", ""),
            "09:00",
        ),
        default_interview_end=_parse_time(os.getenv("DEFAULT_INTERVIEW_END", ""), "17:30"),
        max_automated_chases=int(os.getenv("MAX_AUTOMATED_CHASES", "2")),
        ai_confidence_threshold=float(os.getenv("AI_CONFIDENCE_THRESHOLD", "0.82")),
        email_provider=os.getenv("EMAIL_PROVIDER", "mock"),
        calendar_provider=os.getenv("CALENDAR_PROVIDER", "mock"),
        crm_connector=os.getenv("CRM_CONNECTOR", "manual"),
        enable_gmail_reply_sync=os.getenv("ENABLE_GMAIL_REPLY_SYNC", "true").lower() == "true",
        smtp_host=os.getenv("SMTP_HOST", ""),
        smtp_port=int(os.getenv("SMTP_PORT", "587")),
        smtp_username=os.getenv("SMTP_USERNAME", ""),
        smtp_password=os.getenv("SMTP_PASSWORD", ""),
        smtp_from_email=os.getenv("SMTP_FROM_EMAIL", ""),
        smtp_from_name=os.getenv("SMTP_FROM_NAME", "David Walsh"),
        smtp_use_tls=os.getenv("SMTP_USE_TLS", "true").lower() == "true",
        smtp_use_ssl=os.getenv("SMTP_USE_SSL", "false").lower() == "true",
        google_oauth_client_id=os.getenv("GOOGLE_OAUTH_CLIENT_ID", ""),
        google_oauth_client_secret=os.getenv("GOOGLE_OAUTH_CLIENT_SECRET", ""),
        google_oauth_redirect_uri=os.getenv(
            "GOOGLE_OAUTH_REDIRECT_URI",
            "http://127.0.0.1:8005/api/integrations/google/callback",
        ),
        google_oauth_hosted_domain=os.getenv("GOOGLE_OAUTH_HOSTED_DOMAIN", ""),
        google_oauth_login_hint=os.getenv("GOOGLE_OAUTH_LOGIN_HINT", ""),
        google_calendar_id=os.getenv("GOOGLE_CALENDAR_ID", "primary"),
        check_recruiter_calendar_conflicts=os.getenv("CHECK_RECRUITER_CALENDAR_CONFLICTS", "false").lower() == "true",
        enable_automation_worker=os.getenv("ENABLE_AUTOMATION_WORKER", "true").lower() == "true",
        worker_due_work_interval_seconds=int(os.getenv("WORKER_DUE_WORK_INTERVAL_SECONDS", "300")),
        worker_gmail_sync_interval_seconds=int(os.getenv("WORKER_GMAIL_SYNC_INTERVAL_SECONDS", "300")),
        login_rate_limit_attempts=int(os.getenv("LOGIN_RATE_LIMIT_ATTEMPTS", "8")),
        public_rate_limit_attempts=int(os.getenv("PUBLIC_RATE_LIMIT_ATTEMPTS", "40")),
    )


def validate_runtime_settings(settings: Settings) -> None:
    if settings.app_env == "production" and not settings.auth_configured:
        raise RuntimeError("Production auth is not configured.")
