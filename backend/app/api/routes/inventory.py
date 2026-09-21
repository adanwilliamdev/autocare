import uuid
from typing import Annotated

from fastapi import APIRouter, Query, status

from app.api.deps import SessionDep, require_roles
from app.models import Role, User
from app.schemas.inventory import MovementResponse, PartRequest, PartResponse
from app.services import inventory as service

router = APIRouter(prefix="/inventory", tags=["Estoque"])

# Estoque é restrito a ADMIN e MANAGER: RECEPTIONIST e MECHANIC não criam peças nem
# movimentam estoque diretamente.
stock_roles = require_roles(Role.ADMIN, Role.MANAGER)
StockUser = Annotated[User, stock_roles]
Quantity = Annotated[int, Query(gt=0, description="Quantidade positiva")]
Reason = Annotated[str | None, Query(max_length=255)]


@router.post("/parts", response_model=PartResponse, status_code=status.HTTP_201_CREATED)
async def create_part(data: PartRequest, session: SessionDep, user: StockUser):
    return await service.create_part(session, data, user.id)


@router.get("/parts", response_model=list[PartResponse], dependencies=[stock_roles])
async def list_parts(session: SessionDep):
    return await service.list_parts(session)


# Rotas estáticas ("low-stock") precisam vir antes de "/parts/{part_id}".
@router.get("/parts/low-stock", response_model=list[PartResponse], dependencies=[stock_roles])
async def list_low_stock_parts(session: SessionDep):
    return await service.list_low_stock_parts(session)


@router.get("/parts/{part_id}", response_model=PartResponse, dependencies=[stock_roles])
async def get_part(part_id: uuid.UUID, session: SessionDep):
    return await service.get_part_response(session, part_id)


@router.put("/parts/{part_id}", response_model=PartResponse, dependencies=[stock_roles])
async def update_part(part_id: uuid.UUID, data: PartRequest, session: SessionDep):
    return await service.update_part(session, part_id, data)


@router.delete(
    "/parts/{part_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[stock_roles]
)
async def delete_part(part_id: uuid.UUID, session: SessionDep) -> None:
    """Exclusão lógica: marca a peça como inativa."""
    await service.deactivate_part(session, part_id)


@router.post("/parts/{part_id}/add-stock", status_code=status.HTTP_204_NO_CONTENT)
async def add_stock(
    part_id: uuid.UUID,
    quantity: Quantity,
    session: SessionDep,
    user: StockUser,
    reason: Reason = None,
) -> None:
    # O usuário de auditoria vem sempre do JWT, nunca de um parâmetro do cliente.
    await service.add_stock(session, part_id, quantity, reason, user.id)


@router.post("/parts/{part_id}/remove-stock", status_code=status.HTTP_204_NO_CONTENT)
async def remove_stock(
    part_id: uuid.UUID,
    quantity: Quantity,
    session: SessionDep,
    user: StockUser,
    reason: Reason = None,
) -> None:
    await service.remove_stock(session, part_id, quantity, reason, user.id)


@router.get(
    "/parts/{part_id}/movements", response_model=list[MovementResponse], dependencies=[stock_roles]
)
async def list_part_movements(part_id: uuid.UUID, session: SessionDep):
    return await service.list_movements(session, part_id)
