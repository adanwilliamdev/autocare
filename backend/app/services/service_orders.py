import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BusinessError, ForbiddenError, NotFoundError
from app.models import Role, ServiceOrder, ServiceOrderStatus, User, service_order_number_seq
from app.schemas.service_order import (
    ServiceOrderRequest,
    ServiceOrderResponse,
    StatusUpdateRequest,
)
from app.services.clients import get_client
from app.services.mechanics import get_mechanic, get_mechanic_by_user_id
from app.services.vehicles import get_vehicle

S = ServiceOrderStatus

VALID_TRANSITIONS: dict[ServiceOrderStatus, set[ServiceOrderStatus]] = {
    S.CRIADA: {S.EM_DIAGNOSTICO, S.CANCELADA},
    S.EM_DIAGNOSTICO: {S.AGUARDANDO_APROVACAO, S.CANCELADA},
    S.AGUARDANDO_APROVACAO: {S.APROVADA, S.CANCELADA},
    S.APROVADA: {S.EM_EXECUCAO, S.CANCELADA},
    S.EM_EXECUCAO: {S.FINALIZADA, S.CANCELADA},
    S.FINALIZADA: set(),
    S.CANCELADA: set(),
}


async def get_service_order(session: AsyncSession, order_id: uuid.UUID) -> ServiceOrder:
    order = await session.get(ServiceOrder, order_id)
    if order is None:
        raise NotFoundError(f"Ordem de serviço não encontrada com ID: {order_id}")
    return order


async def _assert_can_access(session: AsyncSession, order: ServiceOrder, user: User) -> None:
    """Um MECHANIC só enxerga/altera as ordens atribuídas ao seu próprio perfil de mecânico."""
    if user.role != Role.MECHANIC:
        return
    mechanic = await get_mechanic_by_user_id(session, user.id)
    if mechanic is None:
        raise ForbiddenError("Usuário não possui um perfil de mecânico vinculado")
    if order.mechanic_id != mechanic.id:
        raise ForbiddenError("Esta ordem de serviço não está atribuída a você")


def _validate_transition(current: ServiceOrderStatus, new: ServiceOrderStatus) -> None:
    if current == new:
        return
    if new not in VALID_TRANSITIONS[current]:
        raise BusinessError(f"Transição de status inválida de {current} para {new}")


async def _next_order_number(session: AsyncSession) -> str:
    seq = await session.scalar(select(service_order_number_seq.next_value()))
    return f"OS{datetime.now(UTC).year}{seq:06d}"


async def create_service_order(
    session: AsyncSession, data: ServiceOrderRequest
) -> ServiceOrderResponse:
    client = await get_client(session, data.client_id)
    vehicle = await get_vehicle(session, data.vehicle_id)
    if data.mechanic_id:
        await get_mechanic(session, data.mechanic_id)

    order = ServiceOrder(
        order_number=await _next_order_number(session),
        client_id=client.id,
        vehicle_id=vehicle.id,
        mechanic_id=data.mechanic_id,
        reported_problem=data.reported_problem,
        status=ServiceOrderStatus.CRIADA,
    )
    session.add(order)
    await session.commit()
    await session.refresh(order)
    return ServiceOrderResponse.from_model(order)


async def update_status(
    session: AsyncSession, order_id: uuid.UUID, data: StatusUpdateRequest, user: User
) -> ServiceOrderResponse:
    order = await get_service_order(session, order_id)
    await _assert_can_access(session, order, user)
    _validate_transition(order.status, data.status)

    order.status = data.status
    if data.diagnosis is not None:
        order.diagnosis = data.diagnosis
    if data.status == ServiceOrderStatus.EM_EXECUCAO:
        order.started_at = datetime.now(UTC)
    if data.status == ServiceOrderStatus.FINALIZADA:
        order.completed_at = datetime.now(UTC)

    await session.commit()
    return ServiceOrderResponse.from_model(order)


async def assign_mechanic(
    session: AsyncSession, order_id: uuid.UUID, mechanic_id: uuid.UUID
) -> ServiceOrderResponse:
    order = await get_service_order(session, order_id)
    await get_mechanic(session, mechanic_id)
    order.mechanic_id = mechanic_id
    await session.commit()
    await session.refresh(order)
    return ServiceOrderResponse.from_model(order)


async def get_service_order_response(
    session: AsyncSession, order_id: uuid.UUID, user: User
) -> ServiceOrderResponse:
    order = await get_service_order(session, order_id)
    await _assert_can_access(session, order, user)
    return ServiceOrderResponse.from_model(order)


async def _list(session: AsyncSession, *conditions) -> list[ServiceOrderResponse]:
    result = await session.scalars(
        select(ServiceOrder).where(*conditions).order_by(ServiceOrder.created_at.desc())
    )
    return [ServiceOrderResponse.from_model(o) for o in result]


async def list_service_orders(session: AsyncSession) -> list[ServiceOrderResponse]:
    return await _list(session)


async def list_for_mechanic(session: AsyncSession, user: User) -> list[ServiceOrderResponse]:
    """Ordens atribuídas ao perfil de mecânico do usuário (vazio se ele não tiver perfil)."""
    mechanic = await get_mechanic_by_user_id(session, user.id)
    if mechanic is None:
        return []
    return await _list(session, ServiceOrder.mechanic_id == mechanic.id)


async def list_by_client(session: AsyncSession, client_id: uuid.UUID) -> list[ServiceOrderResponse]:
    return await _list(session, ServiceOrder.client_id == client_id)


async def list_by_vehicle(
    session: AsyncSession, vehicle_id: uuid.UUID
) -> list[ServiceOrderResponse]:
    return await _list(session, ServiceOrder.vehicle_id == vehicle_id)


async def list_by_status(
    session: AsyncSession, status: ServiceOrderStatus
) -> list[ServiceOrderResponse]:
    return await _list(session, ServiceOrder.status == status)
