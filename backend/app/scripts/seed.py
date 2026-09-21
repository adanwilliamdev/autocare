"""Cria o usuário administrador inicial. Uso: python -m app.scripts.seed"""

import asyncio

from sqlalchemy import select

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.session import SessionLocal, engine
from app.models import Role, User


async def main() -> None:
    settings = get_settings()
    async with SessionLocal() as session:
        exists = await session.scalar(
            select(User.id).where(User.email == settings.seed_admin_email)
        )
        if exists:
            print("Usuário admin já existe, pulando seed.")
        else:
            session.add(
                User(
                    name="Administrador",
                    email=settings.seed_admin_email,
                    password_hash=await hash_password(settings.seed_admin_password),
                    role=Role.ADMIN,
                    is_active=True,
                )
            )
            await session.commit()
            print(f"Usuário admin criado: {settings.seed_admin_email}")
            if settings.seed_admin_password == "admin123":
                print(
                    "⚠️  Senha padrão em uso — defina SEED_ADMIN_PASSWORD fora de desenvolvimento."
                )
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
