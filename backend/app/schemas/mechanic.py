import uuid
from datetime import datetime

from pydantic import Field

from app.schemas.common import CamelModel


class MechanicRequest(CamelModel):
    name: str = Field(min_length=1)
    specialty: str | None = None
    phone: str | None = None
    # Opcional: vincula o perfil a uma conta de login (User com role MECHANIC), permitindo
    # que o próprio mecânico acesse suas OS pelo sistema.
    user_id: uuid.UUID | None = None


class MechanicResponse(CamelModel):
    id: uuid.UUID
    name: str
    specialty: str | None
    phone: str | None
    is_available: bool
    created_at: datetime
    is_active: bool
