import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, Sequence, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.client import Client
from app.models.enums import BudgetStatus
from app.models.mixins import Timestamps, UUIDPrimaryKey
from app.models.vehicle import Vehicle

budget_number_seq = Sequence("budget_number_seq", metadata=Base.metadata)


class Budget(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "budgets"

    budget_number: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    client_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("clients.id"), index=True, nullable=False
    )
    vehicle_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("vehicles.id"), index=True, nullable=False
    )
    service_order_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("service_orders.id"), unique=True
    )
    description: Mapped[str | None] = mapped_column(String)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[BudgetStatus] = mapped_column(
        Enum(BudgetStatus, name="budget_status"),
        default=BudgetStatus.PENDENTE,
        server_default=BudgetStatus.PENDENTE.value,
        index=True,
        nullable=False,
    )
    valid_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    client: Mapped[Client] = relationship(lazy="joined")
    vehicle: Mapped[Vehicle] = relationship(lazy="joined")
