from fastapi import APIRouter, Request, Response, status

from app.api.deps import SessionDep, require_roles
from app.models import Role
from app.schemas.auth import (
    CreateUserRequest,
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RegisterRequest,
)
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest, request: Request, session: SessionDep):
    client_ip = request.client.host if request.client else None
    return await auth_service.login(session, data, client_ip)


@router.post("/refresh", response_model=LoginResponse)
async def refresh(data: RefreshTokenRequest, session: SessionDep):
    return await auth_service.refresh(session, data)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(data: RefreshTokenRequest, session: SessionDep) -> None:
    await auth_service.logout(session, data)


@router.post("/register", status_code=status.HTTP_201_CREATED, response_class=Response)
async def register(data: RegisterRequest, session: SessionDep) -> Response:
    """Autocadastro público. Sempre cria a conta como RECEPTIONIST."""
    await auth_service.register(session, data)
    return Response(status_code=status.HTTP_201_CREATED)


@router.post(
    "/users",
    status_code=status.HTTP_201_CREATED,
    response_class=Response,
    dependencies=[require_roles(Role.ADMIN)],
)
async def create_user(data: CreateUserRequest, session: SessionDep) -> Response:
    """Criação de usuário com papel arbitrário. Restrito a ADMIN."""
    await auth_service.create_user_by_admin(session, data)
    return Response(status_code=status.HTTP_201_CREATED)
