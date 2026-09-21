import uuid
from datetime import datetime

from pydantic import Field, field_validator

from app.models.vehicle import Vehicle
from app.schemas.common import CamelModel

PLATE_PATTERN = r"^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$"


class VehicleRequest(CamelModel):
    plate: str = Field(pattern=PLATE_PATTERN, description="ABC1D23 (Mercosul) ou ABC1234")
    brand: str = Field(min_length=1)
    model: str = Field(min_length=1)
    year: int = Field(ge=1)
    mileage: int | None = Field(default=None, ge=0)
    fuel_type: str | None = None
    client_id: uuid.UUID

    @field_validator("plate", mode="before")
    @classmethod
    def _normalize_plate(cls, value: object) -> object:
        return value.strip().upper().replace("-", "") if isinstance(value, str) else value


class VehicleResponse(CamelModel):
    id: uuid.UUID
    plate: str
    brand: str
    model: str
    year: int
    mileage: int | None
    fuel_type: str | None
    client_id: uuid.UUID
    client_name: str
    created_at: datetime
    is_active: bool

    @classmethod
    def from_model(cls, v: Vehicle) -> "VehicleResponse":
        return cls(
            id=v.id,
            plate=v.plate,
            brand=v.brand,
            model=v.model,
            year=v.year,
            mileage=v.mileage,
            fuel_type=v.fuel_type,
            client_id=v.client_id,
            client_name=v.client.name,
            created_at=v.created_at,
            is_active=v.is_active,
        )
