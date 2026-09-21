import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BusinessError, NotFoundError
from app.models import Vehicle
from app.schemas.vehicle import VehicleRequest, VehicleResponse
from app.services.clients import get_client


async def get_vehicle(session: AsyncSession, vehicle_id: uuid.UUID) -> Vehicle:
    vehicle = await session.get(Vehicle, vehicle_id)
    if vehicle is None:
        raise NotFoundError(f"Veículo não encontrado com ID: {vehicle_id}")
    return vehicle


async def _assert_plate_free(session: AsyncSession, plate: str) -> None:
    if await session.scalar(select(Vehicle.id).where(Vehicle.plate == plate)):
        raise BusinessError(f"Já existe um veículo com esta placa: {plate}")


async def list_vehicles(session: AsyncSession) -> list[VehicleResponse]:
    result = await session.scalars(
        select(Vehicle).where(Vehicle.is_active.is_(True)).order_by(Vehicle.created_at.desc())
    )
    return [VehicleResponse.from_model(v) for v in result.unique()]


async def list_vehicles_by_client(
    session: AsyncSession, client_id: uuid.UUID
) -> list[VehicleResponse]:
    await get_client(session, client_id)
    result = await session.scalars(
        select(Vehicle).where(Vehicle.client_id == client_id, Vehicle.is_active.is_(True))
    )
    return [VehicleResponse.from_model(v) for v in result.unique()]


async def create_vehicle(session: AsyncSession, data: VehicleRequest) -> VehicleResponse:
    await _assert_plate_free(session, data.plate)
    await get_client(session, data.client_id)

    vehicle = Vehicle(**data.model_dump(), is_active=True)
    session.add(vehicle)
    await session.commit()
    await session.refresh(vehicle)
    return VehicleResponse.from_model(vehicle)


async def update_vehicle(
    session: AsyncSession, vehicle_id: uuid.UUID, data: VehicleRequest
) -> VehicleResponse:
    vehicle = await get_vehicle(session, vehicle_id)
    if vehicle.plate != data.plate:
        await _assert_plate_free(session, data.plate)
    if vehicle.client_id != data.client_id:
        await get_client(session, data.client_id)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(vehicle, field, value)
    await session.commit()
    await session.refresh(vehicle)
    return VehicleResponse.from_model(vehicle)


async def get_vehicle_response(session: AsyncSession, vehicle_id: uuid.UUID) -> VehicleResponse:
    return VehicleResponse.from_model(await get_vehicle(session, vehicle_id))


async def deactivate_vehicle(session: AsyncSession, vehicle_id: uuid.UUID) -> None:
    vehicle = await get_vehicle(session, vehicle_id)
    vehicle.is_active = False
    await session.commit()


async def update_mileage(session: AsyncSession, vehicle_id: uuid.UUID, mileage: int) -> None:
    vehicle = await get_vehicle(session, vehicle_id)
    vehicle.mileage = mileage
    await session.commit()
