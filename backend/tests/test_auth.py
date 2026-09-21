from datetime import UTC, datetime, timedelta

import jwt
from sqlalchemy import select

from app.core.config import get_settings
from app.models import RefreshToken, Role
from tests.conftest import PASSWORD, create_user, login_headers


async def test_login_returns_tokens_and_profile(api):
    user = await create_user(Role.MANAGER)
    resp = await api.post("/auth/login", json={"email": user.email, "password": PASSWORD})
    assert resp.status_code == 200
    body = resp.json()
    assert set(body) == {"token", "refreshToken", "userId", "name", "email", "role"}
    assert body["role"] == "MANAGER"
    assert body["userId"] == str(user.id)


async def test_login_failures_share_one_generic_message(api):
    user = await create_user(Role.ADMIN)
    inactive = await create_user(Role.ADMIN, active=False)

    wrong_password = await api.post("/auth/login", json={"email": user.email, "password": "x"})
    unknown_email = await api.post("/auth/login", json={"email": "nao@existe.com", "password": "x"})
    inactive_user = await api.post(
        "/auth/login", json={"email": inactive.email, "password": PASSWORD}
    )

    for resp in (wrong_password, unknown_email, inactive_user):
        assert resp.status_code == 401
        assert resp.json()["message"] == "Email ou senha inválidos"


async def test_login_is_rate_limited(api):
    for _ in range(5):
        resp = await api.post("/auth/login", json={"email": "a@b.com", "password": "x"})
        assert resp.status_code == 401
    resp = await api.post("/auth/login", json={"email": "a@b.com", "password": "x"})
    assert resp.status_code == 429


async def test_login_still_works_when_redis_is_down(api, monkeypatch):
    from redis.exceptions import ConnectionError as RedisConnectionError

    from app.core import cache

    class BrokenRedis:
        async def incr(self, *_):
            raise RedisConnectionError("down")

    monkeypatch.setattr(cache, "_redis", BrokenRedis())
    user = await create_user(Role.ADMIN)
    resp = await api.post("/auth/login", json={"email": user.email, "password": PASSWORD})
    assert resp.status_code == 200


async def test_register_always_creates_a_receptionist(api):
    resp = await api.post(
        "/auth/register",
        json={"name": "Novo", "email": "novo@x.com", "password": "abc12345", "role": "ADMIN"},
    )
    assert resp.status_code == 201
    login = await api.post("/auth/login", json={"email": "novo@x.com", "password": "abc12345"})
    assert login.json()["role"] == "RECEPTIONIST"


async def test_register_rejects_duplicate_email(api):
    payload = {"name": "A", "email": "dup@x.com", "password": "abc12345"}
    assert (await api.post("/auth/register", json=payload)).status_code == 201
    resp = await api.post("/auth/register", json=payload)
    assert resp.status_code == 400
    assert resp.json()["message"] == "Este email já está cadastrado"


async def test_only_admin_can_create_privileged_users(api, headers_for):
    payload = {"name": "Chefe", "email": "chefe@x.com", "password": "abc12345", "role": "manager"}

    receptionist = await headers_for(Role.RECEPTIONIST)
    assert (await api.post("/auth/users", json=payload, headers=receptionist)).status_code == 403
    assert (await api.post("/auth/users", json=payload)).status_code == 401

    admin = await headers_for(Role.ADMIN)
    assert (await api.post("/auth/users", json=payload, headers=admin)).status_code == 201
    login = await api.post("/auth/login", json={"email": "chefe@x.com", "password": "abc12345"})
    assert login.json()["role"] == "MANAGER"

    bad_role = {**payload, "email": "outro@x.com", "role": "SUPERUSER"}
    assert (await api.post("/auth/users", json=bad_role, headers=admin)).status_code == 422


async def test_refresh_rotates_token_and_old_one_stops_working(api, session):
    user = await create_user(Role.ADMIN)
    first = (await api.post("/auth/login", json={"email": user.email, "password": PASSWORD})).json()

    refreshed = await api.post("/auth/refresh", json={"refreshToken": first["refreshToken"]})
    assert refreshed.status_code == 200
    second = refreshed.json()
    assert second["refreshToken"] != first["refreshToken"]

    replay = await api.post("/auth/refresh", json={"refreshToken": first["refreshToken"]})
    assert replay.status_code == 400

    assert (
        await api.post("/auth/refresh", json={"refreshToken": second["refreshToken"]})
    ).status_code == 200


async def test_refresh_tokens_are_stored_hashed(api, session):
    user = await create_user(Role.ADMIN)
    body = (await api.post("/auth/login", json={"email": user.email, "password": PASSWORD})).json()
    stored = (await session.scalars(select(RefreshToken))).all()
    assert len(stored) == 1
    assert stored[0].token_hash != body["refreshToken"]
    assert len(stored[0].token_hash) == 64


async def test_logout_revokes_refresh_token(api):
    user = await create_user(Role.ADMIN)
    body = (await api.post("/auth/login", json={"email": user.email, "password": PASSWORD})).json()
    assert (
        await api.post("/auth/logout", json={"refreshToken": body["refreshToken"]})
    ).status_code == 204
    resp = await api.post("/auth/refresh", json={"refreshToken": body["refreshToken"]})
    assert resp.status_code == 400


async def test_invalid_and_expired_tokens_are_rejected(api):
    settings = get_settings()
    user = await create_user(Role.ADMIN)
    expired = jwt.encode(
        {"sub": str(user.id), "exp": datetime.now(UTC) - timedelta(minutes=1)},
        settings.jwt_secret,
        algorithm="HS256",
    )
    forged = jwt.encode(
        {"sub": str(user.id), "exp": datetime.now(UTC) + timedelta(hours=1)},
        "outro-segredo-qualquer-com-32-caracteres!!",
        algorithm="HS256",
    )
    for token in (expired, forged, "lixo"):
        resp = await api.get("/clients", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 401


async def test_deactivated_user_loses_access_immediately(api, session):
    user = await create_user(Role.ADMIN)
    headers = await login_headers(api, user)
    assert (await api.get("/clients", headers=headers)).status_code == 200

    db_user = await session.get(type(user), user.id)
    db_user.is_active = False
    await session.commit()

    assert (await api.get("/clients", headers=headers)).status_code == 401
