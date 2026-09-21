import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BusinessError, NotFoundError
from app.models import Budget, BudgetStatus, budget_number_seq
from app.schemas.budget import BudgetRequest, BudgetResponse
from app.services.clients import get_client
from app.services.service_orders import get_service_order
from app.services.vehicles import get_vehicle


async def get_budget(session: AsyncSession, budget_id: uuid.UUID) -> Budget:
    budget = await session.get(Budget, budget_id)
    if budget is None:
        raise NotFoundError(f"Orçamento não encontrado com ID: {budget_id}")
    return budget


async def _next_budget_number(session: AsyncSession) -> str:
    seq = await session.scalar(select(budget_number_seq.next_value()))
    return f"BUD{datetime.now(UTC).year}{seq:06d}"


async def create_budget(session: AsyncSession, data: BudgetRequest) -> BudgetResponse:
    client = await get_client(session, data.client_id)
    vehicle = await get_vehicle(session, data.vehicle_id)
    if data.service_order_id:
        await get_service_order(session, data.service_order_id)

    budget = Budget(
        budget_number=await _next_budget_number(session),
        client_id=client.id,
        vehicle_id=vehicle.id,
        service_order_id=data.service_order_id,
        description=data.description,
        total_amount=data.total_amount,
        valid_until=data.valid_until,
        status=BudgetStatus.PENDENTE,
    )
    session.add(budget)
    await session.commit()
    await session.refresh(budget)
    return BudgetResponse.from_model(budget)


async def _decide(
    session: AsyncSession, budget_id: uuid.UUID, new_status: BudgetStatus, verb: str
) -> BudgetResponse:
    budget = await get_budget(session, budget_id)
    if budget.status != BudgetStatus.PENDENTE:
        raise BusinessError(f"Apenas orçamentos pendentes podem ser {verb}")
    budget.status = new_status
    await session.commit()
    return BudgetResponse.from_model(budget)


async def approve_budget(session: AsyncSession, budget_id: uuid.UUID) -> BudgetResponse:
    return await _decide(session, budget_id, BudgetStatus.APROVADO, "aprovados")


async def reject_budget(session: AsyncSession, budget_id: uuid.UUID) -> BudgetResponse:
    return await _decide(session, budget_id, BudgetStatus.RECUSADO, "recusados")


async def get_budget_response(session: AsyncSession, budget_id: uuid.UUID) -> BudgetResponse:
    return BudgetResponse.from_model(await get_budget(session, budget_id))


async def _list(session: AsyncSession, *conditions) -> list[BudgetResponse]:
    result = await session.scalars(
        select(Budget).where(*conditions).order_by(Budget.created_at.desc())
    )
    return [BudgetResponse.from_model(b) for b in result]


async def list_budgets(session: AsyncSession) -> list[BudgetResponse]:
    return await _list(session)


async def list_by_client(session: AsyncSession, client_id: uuid.UUID) -> list[BudgetResponse]:
    return await _list(session, Budget.client_id == client_id)


async def list_by_status(session: AsyncSession, status: BudgetStatus) -> list[BudgetResponse]:
    return await _list(session, Budget.status == status)
