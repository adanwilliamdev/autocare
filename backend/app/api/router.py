from fastapi import APIRouter

from app.api.routes import (
    auth,
    budgets,
    clients,
    dashboard,
    health,
    inventory,
    mechanics,
    service_orders,
    vehicles,
)

api_router = APIRouter(prefix="/api")
for module in (
    health,
    auth,
    clients,
    vehicles,
    mechanics,
    inventory,
    service_orders,
    budgets,
    dashboard,
):
    api_router.include_router(module.router)
