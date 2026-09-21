import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import Field

from app.models.budget import Budget
from app.models.enums import BudgetStatus
from app.schemas.common import CamelModel


class BudgetRequest(CamelModel):
    client_id: uuid.UUID
    vehicle_id: uuid.UUID
    service_order_id: uuid.UUID | None = None
    description: str | None = None
    total_amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    valid_until: datetime | None = None


class BudgetResponse(CamelModel):
    id: uuid.UUID
    budget_number: str
    client_id: uuid.UUID
    client_name: str
    vehicle_id: uuid.UUID
    vehicle_info: str
    service_order_id: uuid.UUID | None
    description: str | None
    total_amount: float
    status: BudgetStatus
    valid_until: datetime | None
    created_at: datetime

    @classmethod
    def from_model(cls, b: Budget) -> "BudgetResponse":
        v = b.vehicle
        return cls(
            id=b.id,
            budget_number=b.budget_number,
            client_id=b.client_id,
            client_name=b.client.name,
            vehicle_id=b.vehicle_id,
            vehicle_info=f"{v.brand} {v.model} ({v.plate})",
            service_order_id=b.service_order_id,
            description=b.description,
            total_amount=b.total_amount,
            status=b.status,
            valid_until=b.valid_until,
            created_at=b.created_at,
        )
