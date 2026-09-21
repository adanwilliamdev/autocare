from pydantic import EmailStr, Field, field_validator

from app.models.enums import Role
from app.schemas.common import CamelModel

# bcrypt só considera os primeiros 72 bytes; limitar evita senhas truncadas silenciosamente.
_PASSWORD = Field(min_length=6, max_length=72)


class LoginRequest(CamelModel):
    email: EmailStr
    password: str = Field(min_length=1)


class RefreshTokenRequest(CamelModel):
    refresh_token: str = Field(min_length=1)


# Propositalmente SEM campo "role": o autocadastro público sempre cria RECEPTIONIST.
# Papéis elevados só podem ser atribuídos por um ADMIN via POST /auth/users.
class RegisterRequest(CamelModel):
    name: str = Field(min_length=1)
    email: EmailStr
    password: str = _PASSWORD


class CreateUserRequest(CamelModel):
    name: str = Field(min_length=1)
    email: EmailStr
    password: str = _PASSWORD
    role: Role

    @field_validator("role", mode="before")
    @classmethod
    def _upper_role(cls, value: object) -> object:
        return value.upper() if isinstance(value, str) else value


class LoginResponse(CamelModel):
    token: str
    refresh_token: str
    user_id: str
    name: str
    email: str
    role: Role
