import uuid
from datetime import datetime

from pydantic import EmailStr, Field

from app.schemas.common import CamelModel


class ClientRequest(CamelModel):
    name: str = Field(min_length=1)
    cpf: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None


class ClientResponse(CamelModel):
    id: uuid.UUID
    name: str
    cpf: str | None
    phone: str | None
    email: str | None
    address: str | None
    created_at: datetime
    is_active: bool
    vehicle_count: int
