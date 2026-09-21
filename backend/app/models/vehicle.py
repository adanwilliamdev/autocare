import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, String, Uuid, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.client import Client
from app.models.mixins import Timestamps, UUIDPrimaryKey


class Vehicle(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "vehicles"

    plate: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    brand: Mapped[str] = mapped_column(String, nullable=False)
    model: Mapped[str] = mapped_column(String, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    mileage: Mapped[int | None] = mapped_column(Integer)
    fuel_type: Mapped[str | None] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default=text("true"), nullable=False
    )
    client_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("clients.id"), index=True, nullable=False
    )

    client: Mapped[Client] = relationship(lazy="joined")
