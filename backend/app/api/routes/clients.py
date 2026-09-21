import uuid

from fastapi import APIRouter, status

from app.api.deps import SessionDep, require_roles
from app.models import Role
from app.schemas.client import ClientRequest, ClientResponse
from app.services import clients as service

router = APIRouter(prefix="/clients", tags=["Clientes"])

# Leitura: ADMIN, RECEPTIONIST e MANAGER (relatórios). Escrita: ADMIN e RECEPTIONIST.
read = require_roles(Role.ADMIN, Role.RECEPTIONIST, Role.MANAGER)
write = require_roles(Role.ADMIN, Role.RECEPTIONIST)


@router.post(
    "", response_model=ClientResponse, status_code=status.HTTP_201_CREATED, dependencies=[write]
)
async def create_client(data: ClientRequest, session: SessionDep):
    return await service.create_client(session, data)


@router.get("", response_model=list[ClientResponse], dependencies=[read])
async def list_clients(session: SessionDep):
    return await service.list_clients(session)


@router.get("/search", response_model=list[ClientResponse], dependencies=[read])
async def search_clients(session: SessionDep, name: str = ""):
    return await service.search_clients(session, name)


@router.get("/{client_id}", response_model=ClientResponse, dependencies=[read])
async def get_client(client_id: uuid.UUID, session: SessionDep):
    return await service.get_client_response(session, client_id)


@router.put("/{client_id}", response_model=ClientResponse, dependencies=[write])
async def update_client(client_id: uuid.UUID, data: ClientRequest, session: SessionDep):
    return await service.update_client(session, client_id, data)


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[write])
async def delete_client(client_id: uuid.UUID, session: SessionDep) -> None:
    """Exclusão lógica: marca o cliente como inativo."""
    await service.set_client_active(session, client_id, False)


@router.patch("/{client_id}/activate", status_code=status.HTTP_204_NO_CONTENT, dependencies=[write])
async def activate_client(client_id: uuid.UUID, session: SessionDep) -> None:
    await service.set_client_active(session, client_id, True)
