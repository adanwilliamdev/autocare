import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import hit_rate_limit
from app.core.config import get_settings
from app.core.exceptions import (
    BusinessError,
    NotFoundError,
    TooManyRequestsError,
    UnauthorizedError,
)
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.models import RefreshToken, Role, User
from app.schemas.auth import (
    CreateUserRequest,
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RegisterRequest,
)


async def _issue_refresh_token(session: AsyncSession, user_id: uuid.UUID) -> str:
    token = generate_refresh_token()
    session.add(
        RefreshToken(
            token_hash=hash_refresh_token(token),
            user_id=user_id,
            expires_at=datetime.now(UTC) + timedelta(days=get_settings().refresh_token_days),
        )
    )
    return token


def _login_response(user: User, access_token: str, refresh_token: str) -> LoginResponse:
    return LoginResponse(
        token=access_token,
        refresh_token=refresh_token,
        user_id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
    )


async def login(
    session: AsyncSession, data: LoginRequest, client_ip: str | None = None
) -> LoginResponse:
    settings = get_settings()
    rate_key = f"rl:login:{client_ip or 'unknown'}:{data.email.lower()}"
    if await hit_rate_limit(
        rate_key, settings.login_rate_limit_attempts, settings.login_rate_limit_window_seconds
    ):
        raise TooManyRequestsError()

    user = await session.scalar(select(User).where(User.email == data.email))
    # Mensagem genérica de propósito: não revela se o e-mail existe. O bcrypt roda mesmo sem
    # usuário para que o tempo de resposta também não revele isso.
    password_ok = await verify_password(data.password, user.password_hash if user else None)
    if user is None or not user.is_active or not password_ok:
        raise UnauthorizedError("Email ou senha inválidos")

    access_token = create_access_token(user.id, user.email)
    refresh_token = await _issue_refresh_token(session, user.id)
    await session.commit()
    return _login_response(user, access_token, refresh_token)


async def refresh(session: AsyncSession, data: RefreshTokenRequest) -> LoginResponse:
    token_hash = hash_refresh_token(data.refresh_token)
    stored = await session.scalar(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
    if stored is None:
        raise BusinessError("Refresh token inválido")
    if stored.revoked or stored.expires_at < datetime.now(UTC):
        raise BusinessError("Refresh token expirado ou revogado. Faça login novamente")

    user = await session.get(User, stored.user_id)
    if user is None:
        raise NotFoundError("Usuário não encontrado")
    if not user.is_active:
        raise UnauthorizedError("Usuário não encontrado ou inativo")

    # Rotação: o token antigo é revogado com um UPDATE condicional. Se duas requisições
    # tentarem usar o mesmo token ao mesmo tempo, só uma delas consegue revogá-lo.
    revoked = await session.execute(
        update(RefreshToken)
        .where(RefreshToken.id == stored.id, RefreshToken.revoked.is_(False))
        .values(revoked=True)
    )
    if revoked.rowcount == 0:
        raise BusinessError("Refresh token expirado ou revogado. Faça login novamente")

    new_refresh = await _issue_refresh_token(session, user.id)
    access_token = create_access_token(user.id, user.email)
    await session.commit()
    return _login_response(user, access_token, new_refresh)


async def logout(session: AsyncSession, data: RefreshTokenRequest) -> None:
    await session.execute(
        update(RefreshToken)
        .where(RefreshToken.token_hash == hash_refresh_token(data.refresh_token))
        .values(revoked=True)
    )
    await session.commit()


async def _create_user(
    session: AsyncSession, name: str, email: str, password: str, role: Role
) -> User:
    if await session.scalar(select(User.id).where(User.email == email)):
        raise BusinessError("Este email já está cadastrado")
    user = User(
        name=name,
        email=email,
        password_hash=await hash_password(password),
        role=role,
        is_active=True,
    )
    session.add(user)
    await session.commit()
    return user


async def register(session: AsyncSession, data: RegisterRequest) -> None:
    # Autocadastro público: SEMPRE o papel mínimo. Não existe campo "role" no schema, então
    # ninguém consegue se autopromover a ADMIN por aqui.
    await _create_user(session, data.name, data.email, data.password, Role.RECEPTIONIST)


async def create_user_by_admin(session: AsyncSession, data: CreateUserRequest) -> None:
    await _create_user(session, data.name, data.email, data.password, data.role)
