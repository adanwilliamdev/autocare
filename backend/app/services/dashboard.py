from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import cache_get_json, cache_set_json
from app.core.config import get_settings
from app.models import Client, Part, ServiceOrder, ServiceOrderStatus, Vehicle
from app.schemas.dashboard import DashboardStats

CACHE_KEY = "dashboard:stats"


def _count_orders(*statuses: ServiceOrderStatus):
    return (
        select(func.count())
        .select_from(ServiceOrder)
        .where(ServiceOrder.status.in_(statuses))
        .scalar_subquery()
    )


def _placeholder_sections() -> dict:
    """Seções que já eram valores fixos no backend original (DashboardService.java).

    Ficam isoladas aqui para serem substituídas por consultas reais quando o modelo de
    faturamento estiver definido: hoje `service_orders.total_amount` nunca é preenchido
    e não existe vínculo entre OS e peças usadas.
    """
    months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"]
    values = [8500, 9200, 7800, 11200, 9800, 13450]
    return {
        "monthly_revenue": 32450.0,
        "monthly_revenue_chart": [
            {"month": m, "amount": a} for m, a in zip(months, values, strict=True)
        ],
        "top_mechanics": [
            {"mechanic_id": "1", "mechanic_name": "João Silva", "completed_orders": 45},
            {"mechanic_id": "2", "mechanic_name": "Maria Santos", "completed_orders": 38},
        ],
        "most_used_parts": [
            {"part_id": "1", "part_name": "Filtro de Óleo", "usage_count": 120},
            {"part_id": "2", "part_name": "Pastilha de Freio", "usage_count": 85},
        ],
    }


async def get_dashboard_stats(session: AsyncSession) -> DashboardStats:
    cached = await cache_get_json(CACHE_KEY)
    if cached is not None:
        return DashboardStats.model_validate(cached)

    S = ServiceOrderStatus
    row = (
        await session.execute(
            select(
                select(func.count()).select_from(Client).scalar_subquery(),
                select(func.count()).select_from(Vehicle).scalar_subquery(),
                select(func.count()).select_from(ServiceOrder).scalar_subquery(),
                _count_orders(S.CRIADA, S.EM_DIAGNOSTICO),
                _count_orders(S.EM_EXECUCAO),
                _count_orders(S.AGUARDANDO_APROVACAO),
                select(func.count())
                .select_from(Part)
                .where(Part.is_active.is_(True), Part.stock_quantity <= Part.minimum_stock)
                .scalar_subquery(),
            )
        )
    ).one()

    stats = DashboardStats(
        total_clients=row[0],
        total_vehicles=row[1],
        total_service_orders=row[2],
        open_service_orders=row[3],
        in_progress_service_orders=row[4],
        waiting_approval_service_orders=row[5],
        low_stock_items=row[6],
        **_placeholder_sections(),
    )
    await cache_set_json(
        CACHE_KEY,
        stats.model_dump(mode="json", by_alias=True),
        get_settings().dashboard_cache_ttl_seconds,
    )
    return stats
