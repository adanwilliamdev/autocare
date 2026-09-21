import uuid

from fastapi import APIRouter, status

from app.api.deps import SessionDep, require_roles
from app.models import Role
from app.schemas.mechanic import MechanicRequest, MechanicResponse
from app.services import mechanics as service

router = APIRouter(prefix="/mechanics", tags=["Mecânicos"])

# Gestão da equipe: ADMIN/MANAGER. Leitura também para RECEPTIONIST, que consulta
# mecânicos disponíveis para atribuir a uma ordem de serviço.
read = require_roles(Role.ADMIN, Role.MANAGER, Role.RECEPTIONIST)
manage = require_roles(Role.ADMIN, Role.MANAGER)


@router.post(
    "", response_model=MechanicResponse, status_code=status.HTTP_201_CREATED, dependencies=[manage]
)
async def create_mechanic(data: MechanicRequest, session: SessionDep):
    return await service.create_mechanic(session, data)


@router.get("", response_model=list[MechanicResponse], dependencies=[read])
async def list_mechanics(session: SessionDep):
    return await service.list_mechanics(session)


@router.get("/available", response_model=list[MechanicResponse], dependencies=[read])
async def list_available_mechanics(session: SessionDep):
    return await service.list_available_mechanics(session)


@router.get("/{mechanic_id}", response_model=MechanicResponse, dependencies=[read])
async def get_mechanic(mechanic_id: uuid.UUID, session: SessionDep):
    return await service.get_mechanic(session, mechanic_id)


@router.put("/{mechanic_id}", response_model=MechanicResponse, dependencies=[manage])
async def update_mechanic(mechanic_id: uuid.UUID, data: MechanicRequest, session: SessionDep):
    return await service.update_mechanic(session, mechanic_id, data)


@router.patch(
    "/{mechanic_id}/availability", status_code=status.HTTP_204_NO_CONTENT, dependencies=[manage]
)
async def set_availability(mechanic_id: uuid.UUID, available: bool, session: SessionDep) -> None:
    await service.set_availability(session, mechanic_id, available)


@router.delete("/{mechanic_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[manage])
async def delete_mechanic(mechanic_id: uuid.UUID, session: SessionDep) -> None:
    """Exclusão lógica: marca o mecânico como inativo."""
    await service.deactivate_mechanic(session, mechanic_id)
