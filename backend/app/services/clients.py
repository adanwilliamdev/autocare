import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models import Client, Vehicle
from app.schemas.client import ClientRequest, ClientResponse

# Total de veículos do cliente (inclui inativos, como no backend original).
_vehicle_count = (
    select(func.count(Vehicle.id))
    .where(Vehicle.client_id == Client.id)
    .correlate(Client)
    .scalar_subquery()
    .label("vehicle_count")
)


def _to_response(client: Client, vehicle_count: int) -> ClientResponse:
    return ClientResponse(
        id=client.id,
        name=client.name,
        cpf=client.cpf,
        phone=client.phone,
        email=client.email,
        address=client.address,
        created_at=client.created_at,
        is_active=client.is_active,
        vehicle_count=vehicle_count,
    )


async def get_client(session: AsyncSession, client_id: uuid.UUID) -> Client:
    client = await session.get(Client, client_id)
    if client is None:
        raise NotFoundError(f"Cliente não encontrado com ID: {client_id}")
    return client


async def get_client_response(session: AsyncSession, client_id: uuid.UUID) -> ClientResponse:
    row = (
        await session.execute(select(Client, _vehicle_count).where(Client.id == client_id))
    ).first()
    if row is None:
        raise NotFoundError(f"Cliente não encontrado com ID: {client_id}")
    return _to_response(*row)


async def list_clients(session: AsyncSession) -> list[ClientResponse]:
    rows = await session.execute(
        select(Client, _vehicle_count)
        .where(Client.is_active.is_(True))
        .order_by(Client.created_at.desc())
    )
    return [_to_response(c, n) for c, n in rows]


async def search_clients(session: AsyncSession, name: str) -> list[ClientResponse]:
    rows = await session.execute(
        select(Client, _vehicle_count).where(Client.name.ilike(f"%{name}%")).order_by(Client.name)
    )
    return [_to_response(c, n) for c, n in rows]


async def create_client(session: AsyncSession, data: ClientRequest) -> ClientResponse:
    client = Client(**data.model_dump(), is_active=True)
    session.add(client)
    await session.commit()
    return _to_response(client, 0)


async def update_client(
    session: AsyncSession, client_id: uuid.UUID, data: ClientRequest
) -> ClientResponse:
    client = await get_client(session, client_id)
    # exclude_unset: campos omitidos ficam como estão; null explícito limpa o campo.
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(client, field, value)
    await session.commit()
    return await get_client_response(session, client_id)


async def set_client_active(session: AsyncSession, client_id: uuid.UUID, active: bool) -> None:
    client = await get_client(session, client_id)
    client.is_active = active
    await session.commit()
