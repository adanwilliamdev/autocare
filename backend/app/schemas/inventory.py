import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import Field

from app.models.enums import MovementType
from app.models.part import InventoryMovement, Part
from app.schemas.common import CamelModel


class PartRequest(CamelModel):
    name: str = Field(min_length=1)
    code: str = Field(min_length=1)
    manufacturer: str | None = None
    purchase_price: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    sale_price: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    stock_quantity: int = Field(ge=0)
    minimum_stock: int = Field(default=5, gt=0)


class PartResponse(CamelModel):
    id: uuid.UUID
    name: str
    code: str
    manufacturer: str | None
    purchase_price: float
    sale_price: float
    stock_quantity: int
    minimum_stock: int
    is_low_stock: bool
    created_at: datetime
    is_active: bool

    @classmethod
    def from_model(cls, p: Part) -> "PartResponse":
        return cls(
            id=p.id,
            name=p.name,
            code=p.code,
            manufacturer=p.manufacturer,
            purchase_price=p.purchase_price,
            sale_price=p.sale_price,
            stock_quantity=p.stock_quantity,
            minimum_stock=p.minimum_stock,
            is_low_stock=p.stock_quantity <= p.minimum_stock,
            created_at=p.created_at,
            is_active=p.is_active,
        )


class MovementResponse(CamelModel):
    id: uuid.UUID
    part_id: uuid.UUID
    part_name: str
    type: MovementType
    quantity: int
    previous_quantity: int
    current_quantity: int
    reason: str | None
    reference_id: str | None
    user_id: uuid.UUID | None
    created_at: datetime

    @classmethod
    def from_model(cls, m: InventoryMovement) -> "MovementResponse":
        return cls(
            id=m.id,
            part_id=m.part_id,
            part_name=m.part.name,
            type=m.type,
            quantity=m.quantity,
            previous_quantity=m.previous_quantity,
            current_quantity=m.current_quantity,
            reason=m.reason,
            reference_id=m.reference_id,
            user_id=m.user_id,
            created_at=m.created_at,
        )
