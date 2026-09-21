import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Uuid,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import MovementType
from app.models.mixins import Timestamps, UUIDPrimaryKey


class Part(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "parts"
    __table_args__ = (CheckConstraint("stock_quantity >= 0", name="stock_non_negative"),)

    name: Mapped[str] = mapped_column(String, nullable=False)
    code: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    manufacturer: Mapped[str | None] = mapped_column(String)
    purchase_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    sale_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    stock_quantity: Mapped[int] = mapped_column(
        Integer, default=0, server_default=text("0"), nullable=False
    )
    minimum_stock: Mapped[int] = mapped_column(
        Integer, default=5, server_default=text("5"), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default=text("true"), nullable=False
    )
    # Lock otimista: toda alteração de estoque faz UPDATE ... WHERE version = <valor lido>
    # e falha com 409 se outra requisição alterou a peça no meio do caminho.
    version: Mapped[int] = mapped_column(
        Integer, default=0, server_default=text("0"), nullable=False
    )


class InventoryMovement(UUIDPrimaryKey, Base):
    __tablename__ = "inventory_movements"

    part_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("parts.id"), index=True, nullable=False
    )
    type: Mapped[MovementType] = mapped_column(Enum(MovementType, name="movement_type"))
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    previous_quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    current_quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str | None] = mapped_column(String)
    reference_id: Mapped[str | None] = mapped_column(String)
    # Sempre vem do usuário autenticado (JWT), nunca de um parâmetro enviado pelo cliente.
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="SET NULL")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    part: Mapped[Part] = relationship(lazy="joined")
