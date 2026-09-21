import uuid

from sqlalchemy import Boolean, ForeignKey, String, Uuid, text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import Timestamps, UUIDPrimaryKey


class Mechanic(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "mechanics"

    # Liga o perfil de mecânico a uma conta de login (users.role = MECHANIC).
    # Nullable: nem todo mecânico precisa ter login.
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="SET NULL"), unique=True
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    specialty: Mapped[str | None] = mapped_column(String)
    phone: Mapped[str | None] = mapped_column(String)
    is_available: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default=text("true"), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default=text("true"), nullable=False
    )
