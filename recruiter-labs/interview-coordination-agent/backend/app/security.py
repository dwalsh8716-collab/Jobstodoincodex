import base64
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import json
import time
from typing import Optional, Tuple

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import Settings, get_settings


bearer = HTTPBearer(auto_error=False)
SESSION_COOKIE_NAME = "ica_session"
_RATE_LIMITS: dict[str, list[float]] = {}


def _b64(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def _unb64(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode((value + padding).encode("ascii"))


def _sign(payload: str, secret: str) -> str:
    return hmac.new(secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()


def create_session_token(email: str, settings: Settings) -> Tuple[str, datetime]:
    expires_at = datetime.now(timezone.utc) + timedelta(hours=12)
    payload = _b64(
        json.dumps(
            {
                "email": email,
                "expires_at": expires_at.isoformat(),
            },
            separators=(",", ":"),
        ).encode("utf-8"),
    )
    signature = _sign(payload, settings.session_secret)
    return f"{payload}.{signature}", expires_at


def verify_session_token(token: str, settings: Settings) -> Optional[str]:
    if not settings.session_secret or "." not in token:
        return None

    payload, signature = token.rsplit(".", 1)
    expected = _sign(payload, settings.session_secret)
    if not hmac.compare_digest(signature, expected):
        return None

    try:
        decoded = json.loads(_unb64(payload).decode("utf-8"))
        expires_at = datetime.fromisoformat(decoded["expires_at"])
    except (KeyError, ValueError, json.JSONDecodeError):
        return None

    if expires_at < datetime.now(timezone.utc):
        return None

    email = decoded.get("email")
    return email if isinstance(email, str) else None


def authenticate_login(email: str, password: str, settings: Settings) -> bool:
    if not settings.auth_configured:
        return False
    return hmac.compare_digest(email.lower(), settings.login_email.lower()) and hmac.compare_digest(
        password,
        settings.login_password,
    )


def client_key(request: Request, prefix: str) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    ip_address = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "unknown")
    user_agent = request.headers.get("user-agent", "unknown")[:120]
    digest = hashlib.sha256(f"{ip_address}:{user_agent}".encode("utf-8")).hexdigest()[:24]
    return f"{prefix}:{digest}"


def enforce_rate_limit(key: str, limit: int, window_seconds: int) -> None:
    now = time.monotonic()
    window_start = now - window_seconds
    attempts = [stamp for stamp in _RATE_LIMITS.get(key, []) if stamp >= window_start]
    if len(attempts) >= limit:
        _RATE_LIMITS[key] = attempts
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many attempts. Leave it a few minutes and try again.",
        )
    attempts.append(now)
    _RATE_LIMITS[key] = attempts


def clear_rate_limit(key: str) -> None:
    _RATE_LIMITS.pop(key, None)


def require_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
) -> str:
    settings = get_settings()
    if not settings.auth_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Login is not configured. Set APP_LOGIN_EMAIL, APP_LOGIN_PASSWORD and SESSION_SECRET.",
        )

    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token and credentials:
        token = credentials.credentials
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing session.")

    email = verify_session_token(token, settings)
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session.")
    return email
