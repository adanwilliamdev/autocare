import asyncio
from datetime import UTC, datetime

import pytest

from app.models import Role
from tests.conftest import login_headers


def order_payload(client, vehicle, **extra):
    return {"clientId": str(client.id), "vehicleId": str(vehicle.id), **extra}


async def advance(api, headers, order_id, *statuses):
    for status in statuses:
        resp = await api.patch(
            f"/service-orders/{order_id}/status", json={"status": status}, headers=headers
        )
        assert resp.status_code == 200, resp.text
    return resp.json()


async def test_order_numbers_are_sequential_and_formatted(api, admin, client_and_vehicle):
    client, vehicle = client_and_vehicle
    year = datetime.now(UTC).year
    numbers = []
    for _ in range(3):
        resp = await api.post("/service-orders", json=order_payload(client, vehicle), headers=admin)
        assert resp.status_code == 201
        numbers.append(resp.json()["orderNumber"])
    assert numbers == [f"OS{year}000001", f"OS{year}000002", f"OS{year}000003"]


async def test_concurrent_creation_never_repeats_a_number(api, admin, client_and_vehicle):
    client, vehicle = client_and_vehicle
    responses = await asyncio.gather(
        *(
            api.post("/service-orders", json=order_payload(client, vehicle), headers=admin)
            for _ in range(15)
        )
    )
    assert all(r.status_code == 201 for r in responses)
    numbers = [r.json()["orderNumber"] for r in responses]
    assert len(set(numbers)) == 15


async def test_full_lifecycle_sets_timestamps(api, admin, client_and_vehicle):
    client, vehicle = client_and_vehicle
    order = (
        await api.post("/service-orders", json=order_payload(client, vehicle), headers=admin)
    ).json()
    assert order["status"] == "CRIADA" and order["totalAmount"] == 0

    await advance(api, admin, order["id"], "EM_DIAGNOSTICO", "AGUARDANDO_APROVACAO", "APROVADA")
    running = await advance(api, admin, order["id"], "EM_EXECUCAO")
    assert running["startedAt"] is not None and running["completedAt"] is None
    done = await advance(api, admin, order["id"], "FINALIZADA")
    assert done["completedAt"] is not None


async def test_diagnosis_is_saved_with_status(api, admin, client_and_vehicle):
    client, vehicle = client_and_vehicle
    order = (
        await api.post("/service-orders", json=order_payload(client, vehicle), headers=admin)
    ).json()
    resp = await api.patch(
        f"/service-orders/{order['id']}/status",
        json={"status": "EM_DIAGNOSTICO", "diagnosis": "Pastilhas gastas"},
        headers=admin,
    )
    assert resp.json()["diagnosis"] == "Pastilhas gastas"


@pytest.mark.parametrize(
    "target",
    ["APROVADA", "EM_EXECUCAO", "FINALIZADA"],
)
async def test_invalid_transition_is_rejected(api, admin, client_and_vehicle, target):
    client, vehicle = client_and_vehicle
    order = (
        await api.post("/service-orders", json=order_payload(client, vehicle), headers=admin)
    ).json()
    resp = await api.patch(
        f"/service-orders/{order['id']}/status", json={"status": target}, headers=admin
    )
    assert resp.status_code == 400
    assert "Transição de status inválida" in resp.json()["message"]


async def test_finished_or_cancelled_orders_are_terminal(api, admin, client_and_vehicle):
    client, vehicle = client_and_vehicle
    order = (
        await api.post("/service-orders", json=order_payload(client, vehicle), headers=admin)
    ).json()
    await advance(api, admin, order["id"], "CANCELADA")
    resp = await api.patch(
        f"/service-orders/{order['id']}/status", json={"status": "EM_DIAGNOSTICO"}, headers=admin
    )
    assert resp.status_code == 400


async def test_unknown_status_value_is_a_validation_error(api, admin, client_and_vehicle):
    client, vehicle = client_and_vehicle
    order = (
        await api.post("/service-orders", json=order_payload(client, vehicle), headers=admin)
    ).json()
    resp = await api.patch(
        f"/service-orders/{order['id']}/status", json={"status": "VOANDO"}, headers=admin
    )
    assert resp.status_code == 422


async def test_assign_mechanic_and_filter_by_status(
    api, admin, client_and_vehicle, mechanic_profile
):
    client, vehicle = client_and_vehicle
    _, mechanic = mechanic_profile
    order = (
        await api.post("/service-orders", json=order_payload(client, vehicle), headers=admin)
    ).json()

    resp = await api.patch(
        f"/service-orders/{order['id']}/mechanic",
        params={"mechanicId": str(mechanic.id)},
        headers=admin,
    )
    assert resp.status_code == 200
    assert resp.json()["mechanicName"] == "João Mecânico"

    by_status = await api.get("/service-orders/status/CRIADA", headers=admin)
    assert [o["id"] for o in by_status.json()] == [order["id"]]
    by_client = await api.get(f"/service-orders/client/{client.id}", headers=admin)
    assert len(by_client.json()) == 1


async def test_mechanic_only_accesses_orders_assigned_to_them(
    api, admin, client_and_vehicle, mechanic_profile
):
    client, vehicle = client_and_vehicle
    user, mechanic = mechanic_profile
    mine = (
        await api.post(
            "/service-orders",
            json=order_payload(client, vehicle, mechanicId=str(mechanic.id)),
            headers=admin,
        )
    ).json()
    someone_elses = (
        await api.post("/service-orders", json=order_payload(client, vehicle), headers=admin)
    ).json()

    headers = await login_headers(api, user)
    assert (await api.get(f"/service-orders/{mine['id']}", headers=headers)).status_code == 200
    resp = await api.get(f"/service-orders/{someone_elses['id']}", headers=headers)
    assert resp.status_code == 403
    assert resp.json()["message"] == "Esta ordem de serviço não está atribuída a você"

    ok = await api.patch(
        f"/service-orders/{mine['id']}/status", json={"status": "EM_DIAGNOSTICO"}, headers=headers
    )
    assert ok.status_code == 200
    blocked = await api.patch(
        f"/service-orders/{someone_elses['id']}/status",
        json={"status": "EM_DIAGNOSTICO"},
        headers=headers,
    )
    assert blocked.status_code == 403


async def test_mechanic_without_linked_profile_is_forbidden(
    api, admin, client_and_vehicle, headers_for
):
    client, vehicle = client_and_vehicle
    order = (
        await api.post("/service-orders", json=order_payload(client, vehicle), headers=admin)
    ).json()
    headers = await headers_for(Role.MECHANIC)
    resp = await api.get(f"/service-orders/{order['id']}", headers=headers)
    assert resp.status_code == 403
    assert "perfil de mecânico" in resp.json()["message"]


async def test_mine_lists_only_the_mechanics_own_orders(
    api, admin, client_and_vehicle, mechanic_profile
):
    client, vehicle = client_and_vehicle
    user, mechanic = mechanic_profile
    mine = (
        await api.post(
            "/service-orders",
            json=order_payload(client, vehicle, mechanicId=str(mechanic.id)),
            headers=admin,
        )
    ).json()
    await api.post("/service-orders", json=order_payload(client, vehicle), headers=admin)

    headers = await login_headers(api, user)
    resp = await api.get("/service-orders/mine", headers=headers)
    assert resp.status_code == 200
    assert [o["id"] for o in resp.json()] == [mine["id"]]

    # A listagem geral continua negada ao mecânico; /mine é negada a quem não é mecânico.
    assert (await api.get("/service-orders", headers=headers)).status_code == 403
    assert (await api.get("/service-orders/mine", headers=admin)).status_code == 403


async def test_mine_is_empty_for_mechanic_without_profile(api, headers_for):
    headers = await headers_for(Role.MECHANIC)
    resp = await api.get("/service-orders/mine", headers=headers)
    assert resp.status_code == 200 and resp.json() == []
