import base64
import hashlib
from typing import Optional

from cryptography.fernet import Fernet

from app.config import get_settings


def _fernet() -> Fernet:
    settings = get_settings()
    source = settings.session_secret or "local-development-only"
    key = base64.urlsafe_b64encode(hashlib.sha256(source.encode("utf-8")).digest())
    return Fernet(key)


def encrypt_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    return _fernet().encrypt(value.encode("utf-8")).decode("utf-8")


def decrypt_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    return _fernet().decrypt(value.encode("utf-8")).decode("utf-8")

