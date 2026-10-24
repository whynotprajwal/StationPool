"""Security utilities: Pure standard library JWT (HS256), hashing, and OTP."""
import base64
import hashlib
import hmac
import json
import random
import string
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.core.config import settings


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64decode(data: str) -> bytes:
    padding = "=" * (4 - (len(data) % 4)) if len(data) % 4 != 0 else ""
    return base64.urlsafe_b64decode(data + padding)


def hash_password(password: str, salt: Optional[str] = None) -> str:
    """PBKDF2 HMAC SHA-256 password hash."""
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000
    ).hex()
    return f"{salt}${hashed}"


def verify_password(plain: str, hashed_str: str) -> bool:
    try:
        salt, _ = hashed_str.split("$", 1)
        return hmac.compare_digest(hash_password(plain, salt), hashed_str)
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate a standard HS256 JWT using Python standard library."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": int(expire.timestamp())})

    header = {"alg": "HS256", "typ": "JWT"}
    header_bytes = json.dumps(header, separators=(",", ":")).encode("utf-8")
    payload_bytes = json.dumps(to_encode, separators=(",", ":")).encode("utf-8")

    header_b64 = _b64encode(header_bytes)
    payload_b64 = _b64encode(payload_bytes)

    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    signature = hmac.new(
        settings.SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256
    ).digest()
    sig_b64 = _b64encode(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"


def decode_access_token(token: str) -> Optional[dict]:
    """Verify and decode standard HS256 JWT."""
    try:
        parts = token.strip().split(".")
        if len(parts) != 3:
            return None

        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
        expected_sig = hmac.new(
            settings.SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256
        ).digest()

        if not hmac.compare_digest(_b64decode(sig_b64), expected_sig):
            return None

        payload_bytes = _b64decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))

        # Verify expiration
        exp = payload.get("exp")
        if exp and exp < datetime.now(timezone.utc).timestamp():
            return None

        return payload
    except Exception:
        return None


def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP of the given length."""
    if settings.DEMO_OTP_ENABLED and settings.APP_ENV == "development":
        return settings.DEMO_OTP_CODE
    return "".join(random.choices(string.digits, k=length))


def hash_pin(pin: str) -> str:
    """Hash a PIN securely using SHA-256."""
    return hashlib.sha256(pin.encode("utf-8")).hexdigest()


def generate_trip_pin(length: int = 4) -> str:
    """Generate a short numeric trip verification PIN."""
    return "".join(random.choices(string.digits, k=length))
