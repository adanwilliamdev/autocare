import uuid
from typing import Annotated

import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_access_token
from app.db.session import get_session
from app.models import Role, User

SessionDep = Annotated[AsyncSession, Depends(get_session)]

_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    session: SessionDep,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> User:
    if credentials is None:
        raise UnauthorizedError("Autenticação necessária")
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = uuid.UUID(payload["sub"])
    except (jwt.PyJWTError, ValueError, KeyError):
        raise UnauthorizedError("Token inválido ou expirado") from None

    # Busca o usuário a cada requisição (em vez de confiar no payload do token) para
    # respeitar imediatamente mudanças de papel e desativação de contas.
    user = await session.get(User, user_id)
    if user is None or not user.is_active:
        raise UnauthorizedError("Usuário não encontrado ou inativo")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_roles(*roles: Role):
    """Dependência que exige autenticação e um dos papéis informados (senão 403).

    Aplicada por rota (e não por router) para que cada endpoint declare exatamente
    quem pode chamá-lo — um router-level extra seria somado, nunca substituído.
    """
    allowed = frozenset(roles)

    async def dependency(user: CurrentUser) -> User:
        if user.role not in allowed:
            raise ForbiddenError()
        return user

    return Depends(dependency)
