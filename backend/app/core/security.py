import asyncio
import hashlib
import secrets
import uuid
from datetime import UTC, datetime, timedelta

import bcrypt
import jwt

from app.core.config import get_settings

BCRYPT_MAX_BYTES = 72

# Hash válido de uma senha aleatória: usado para gastar o mesmo tempo de CPU quando o
# e-mail não existe, evitando revelar quais e-mails estão cadastrados pelo tempo de resposta.
_DUMMY_HASH = bcrypt.hashpw(secrets.token_bytes(16), bcrypt.gensalt(rounds=10)).decode()


def _hash_sync(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=10)).decode()


def _verify_sync(password: str, password_hash: str) -> bool:
    raw = password.encode()
    if len(raw) > BCRYPT_MAX_BYTES:
        return False
    try:
        return bcrypt.checkpw(raw, password_hash.encode())
    except ValueError:
        return False


async def hash_password(password: str) -> str:
    # bcrypt é CPU-bound: roda em thread para não bloquear o event loop.
    return await asyncio.to_thread(_hash_sync, password)


async def verify_password(password: str, password_hash: str | None) -> bool:
    """Verifica a senha. Com password_hash=None ainda gasta o tempo de um bcrypt e devolve False."""
    matches = await asyncio.to_thread(_verify_sync, password, password_hash or _DUMMY_HASH)
    return matches and password_hash is not None


def create_access_token(user_id: uuid.UUID, email: str) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": now,
        "exp": now + timedelta(seconds=settings.access_token_ttl_seconds),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    settings = get_settings()
    return jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=[settings.jwt_algorithm],
        options={"require": ["sub", "exp"]},
    )


def generate_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_refresh_token(token: str) -> str:
    # O refresh token nunca é guardado em texto puro: um vazamento do banco não entrega sessões.
    return hashlib.sha256(token.encode()).hexdigest()
