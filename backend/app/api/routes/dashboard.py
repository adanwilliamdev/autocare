from fastapi import APIRouter

from app.api.deps import SessionDep, require_roles
from app.models import Role
from app.schemas.dashboard import DashboardStats
from app.services import dashboard as service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/stats", response_model=DashboardStats, dependencies=[require_roles(Role.ADMIN, Role.MANAGER)]
)
async def get_stats(session: SessionDep):
    return await service.get_dashboard_stats(session)
