import uuid

from fastapi import APIRouter, status

from app.api.deps import SessionDep, require_roles
from app.models import BudgetStatus, Role
from app.schemas.budget import BudgetRequest, BudgetResponse
from app.services import budgets as service

router = APIRouter(prefix="/budgets", tags=["Orçamentos"])

# Criação/consulta: quem atende o cliente (ADMIN, RECEPTIONIST) e MANAGER (relatórios).
# Aprovar/recusar é decisão financeira: só ADMIN e MANAGER.
read = require_roles(Role.ADMIN, Role.RECEPTIONIST, Role.MANAGER)
create = require_roles(Role.ADMIN, Role.RECEPTIONIST)
decide = require_roles(Role.ADMIN, Role.MANAGER)


@router.post(
    "", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED, dependencies=[create]
)
async def create_budget(data: BudgetRequest, session: SessionDep):
    return await service.create_budget(session, data)


@router.get("", response_model=list[BudgetResponse], dependencies=[read])
async def list_budgets(session: SessionDep):
    return await service.list_budgets(session)


@router.get("/client/{client_id}", response_model=list[BudgetResponse], dependencies=[read])
async def list_by_client(client_id: uuid.UUID, session: SessionDep):
    return await service.list_by_client(session, client_id)


@router.get("/status/{budget_status}", response_model=list[BudgetResponse], dependencies=[read])
async def list_by_status(budget_status: BudgetStatus, session: SessionDep):
    return await service.list_by_status(session, budget_status)


@router.get("/{budget_id}", response_model=BudgetResponse, dependencies=[read])
async def get_budget(budget_id: uuid.UUID, session: SessionDep):
    return await service.get_budget_response(session, budget_id)


@router.patch("/{budget_id}/approve", response_model=BudgetResponse, dependencies=[decide])
async def approve_budget(budget_id: uuid.UUID, session: SessionDep):
    return await service.approve_budget(session, budget_id)


@router.patch("/{budget_id}/reject", response_model=BudgetResponse, dependencies=[decide])
async def reject_budget(budget_id: uuid.UUID, session: SessionDep):
    return await service.reject_budget(session, budget_id)
