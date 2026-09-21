import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BusinessError, NotFoundError
from app.models import Mechanic
from app.schemas.mechanic import MechanicRequest, MechanicResponse


async def get_mechanic(session: AsyncSession, mechanic_id: uuid.UUID) -> Mechanic:
    mechanic = await session.get(Mechanic, mechanic_id)
    if mechanic is None:
        raise NotFoundError(f"Mecânico não encontrado com ID: {mechanic_id}")
    return mechanic


async def get_mechanic_by_user_id(session: AsyncSession, user_id: uuid.UUID) -> Mechanic | None:
    return await session.scalar(select(Mechanic).where(Mechanic.user_id == user_id))


async def _assert_user_not_linked(session: AsyncSession, user_id: uuid.UUID) -> None:
    if await get_mechanic_by_user_id(session, user_id):
        raise BusinessError("Este usuário já está vinculado a outro perfil de mecânico")


async def list_mechanics(session: AsyncSession) -> list[Mechanic]:
    result = await session.scalars(
        select(Mechanic).where(Mechanic.is_active.is_(True)).order_by(Mechanic.created_at.desc())
    )
    return list(result)


async def list_available_mechanics(session: AsyncSession) -> list[Mechanic]:
    result = await session.scalars(
        select(Mechanic).where(Mechanic.is_available.is_(True), Mechanic.is_active.is_(True))
    )
    return list(result)


async def create_mechanic(session: AsyncSession, data: MechanicRequest) -> Mechanic:
    if data.user_id:
        await _assert_user_not_linked(session, data.user_id)
    mechanic = Mechanic(**data.model_dump(), is_available=True, is_active=True)
    session.add(mechanic)
    await session.commit()
    return mechanic


async def update_mechanic(
    session: AsyncSession, mechanic_id: uuid.UUID, data: MechanicRequest
) -> Mechanic:
    mechanic = await get_mechanic(session, mechanic_id)
    if data.user_id and data.user_id != mechanic.user_id:
        await _assert_user_not_linked(session, data.user_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(mechanic, field, value)
    await session.commit()
    return mechanic


async def deactivate_mechanic(session: AsyncSession, mechanic_id: uuid.UUID) -> None:
    mechanic = await get_mechanic(session, mechanic_id)
    mechanic.is_active = False
    await session.commit()


async def set_availability(session: AsyncSession, mechanic_id: uuid.UUID, available: bool) -> None:
    mechanic = await get_mechanic(session, mechanic_id)
    mechanic.is_available = available
    await session.commit()


def to_response(mechanic: Mechanic) -> MechanicResponse:
    return MechanicResponse.model_validate(mechanic)
