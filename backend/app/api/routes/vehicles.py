import uuid
from typing import Annotated

from fastapi import APIRouter, Query, status

from app.api.deps import SessionDep, require_roles
from app.models import Role
from app.schemas.vehicle import VehicleRequest, VehicleResponse
from app.services import vehicles as service

router = APIRouter(prefix="/vehicles", tags=["Veículos"])

read = require_roles(Role.ADMIN, Role.RECEPTIONIST, Role.MANAGER, Role.MECHANIC)
write = require_roles(Role.ADMIN, Role.RECEPTIONIST)
update_km = require_roles(Role.ADMIN, Role.RECEPTIONIST, Role.MECHANIC)


@router.post(
    "", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED, dependencies=[write]
)
async def create_vehicle(data: VehicleRequest, session: SessionDep):
    return await service.create_vehicle(session, data)


@router.get("", response_model=list[VehicleResponse], dependencies=[read])
async def list_vehicles(session: SessionDep):
    return await service.list_vehicles(session)


@router.get("/client/{client_id}", response_model=list[VehicleResponse], dependencies=[read])
async def list_vehicles_by_client(client_id: uuid.UUID, session: SessionDep):
    return await service.list_vehicles_by_client(session, client_id)


@router.get("/{vehicle_id}", response_model=VehicleResponse, dependencies=[read])
async def get_vehicle(vehicle_id: uuid.UUID, session: SessionDep):
    return await service.get_vehicle_response(session, vehicle_id)


@router.put("/{vehicle_id}", response_model=VehicleResponse, dependencies=[write])
async def update_vehicle(vehicle_id: uuid.UUID, data: VehicleRequest, session: SessionDep):
    return await service.update_vehicle(session, vehicle_id, data)


@router.patch(
    "/{vehicle_id}/mileage", status_code=status.HTTP_204_NO_CONTENT, dependencies=[update_km]
)
async def update_mileage(
    vehicle_id: uuid.UUID, mileage: Annotated[int, Query(ge=0)], session: SessionDep
) -> None:
    await service.update_mileage(session, vehicle_id, mileage)


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[write])
async def delete_vehicle(vehicle_id: uuid.UUID, session: SessionDep) -> None:
    """Exclusão lógica: marca o veículo como inativo."""
    await service.deactivate_vehicle(session, vehicle_id)
