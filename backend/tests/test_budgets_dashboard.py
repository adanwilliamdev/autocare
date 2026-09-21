from datetime import UTC, datetime

from app.core import cache
from app.models import Role


def budget_payload(client, vehicle, **extra):
    return {
        "clientId": str(client.id),
        "vehicleId": str(vehicle.id),
        "description": "Troca de pastilhas",
        "totalAmount": 450.5,
        **extra,
    }


async def test_create_budget_numbering_and_defaults(api, admin, client_and_vehicle):
    client, vehicle = client_and_vehicle
    resp = await api.post(
        "/budgets",
        json=budget_payload(client, vehicle, validUntil="2026-12-31T00:00:00Z"),
        headers=admin,
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["budgetNumber"] == f"BUD{datetime.now(UTC).year}000001"
    assert body["status"] == "PENDENTE"
    assert body["totalAmount"] == 450.5
    assert body["vehicleInfo"] == "VW Gol (ABC1D23)"

    second = await api.post("/budgets", json=budget_payload(client, vehicle), headers=admin)
    assert second.json()["budgetNumber"].endswith("000002")


async def test_total_must_be_positive(api, admin, client_and_vehicle):
    client, vehicle = client_and_vehicle
    resp = await api.post(
        "/budgets", json=budget_payload(client, vehicle, totalAmount=0), headers=admin
    )
    assert resp.status_code == 422


async def test_only_pending_budgets_can_be_decided(api, admin, client_and_vehicle):
    client, vehicle = client_and_vehicle
    budget = (
        await api.post("/budgets", json=budget_payload(client, vehicle), headers=admin)
    ).json()

    approved = await api.patch(f"/budgets/{budget['id']}/approve", headers=admin)
    assert approved.status_code == 200 and approved.json()["status"] == "APROVADO"

    again = await api.patch(f"/budgets/{budget['id']}/reject", headers=admin)
    assert again.status_code == 400
    assert again.json()["message"] == "Apenas orçamentos pendentes podem ser recusados"


async def test_manager_can_reject_but_receptionist_cannot(
    api, admin, client_and_vehicle, headers_for
):
    client, vehicle = client_and_vehicle
    budget = (
        await api.post("/budgets", json=budget_payload(client, vehicle), headers=admin)
    ).json()

    receptionist = await headers_for(Role.RECEPTIONIST)
    assert (
        await api.patch(f"/budgets/{budget['id']}/reject", headers=receptionist)
    ).status_code == 403

    manager = await headers_for(Role.MANAGER)
    resp = await api.patch(f"/budgets/{budget['id']}/reject", headers=manager)
    assert resp.json()["status"] == "RECUSADO"

    by_status = await api.get("/budgets/status/RECUSADO", headers=manager)
    assert len(by_status.json()) == 1


async def test_one_budget_per_service_order(api, admin, client_and_vehicle):
    client, vehicle = client_and_vehicle
    order = (
        await api.post(
            "/service-orders",
            json={"clientId": str(client.id), "vehicleId": str(vehicle.id)},
            headers=admin,
        )
    ).json()
    first = await api.post(
        "/budgets", json=budget_payload(client, vehicle, serviceOrderId=order["id"]), headers=admin
    )
    assert first.status_code == 201
    second = await api.post(
        "/budgets", json=budget_payload(client, vehicle, serviceOrderId=order["id"]), headers=admin
    )
    assert second.status_code == 409


async def test_dashboard_counts_and_caches_in_redis(api, admin, client_and_vehicle):
    client, vehicle = client_and_vehicle
    await api.post(
        "/service-orders",
        json={"clientId": str(client.id), "vehicleId": str(vehicle.id)},
        headers=admin,
    )
    await api.post(
        "/inventory/parts",
        json={
            "name": "Vela",
            "code": "V1",
            "purchasePrice": 5,
            "salePrice": 9,
            "stockQuantity": 1,
            "minimumStock": 5,
        },
        headers=admin,
    )

    stats = (await api.get("/dashboard/stats", headers=admin)).json()
    assert stats["totalClients"] == 1
    assert stats["totalVehicles"] == 1
    assert stats["totalServiceOrders"] == 1
    assert stats["openServiceOrders"] == 1
    assert stats["lowStockItems"] == 1
    assert {"monthlyRevenueChart", "topMechanics", "mostUsedParts"} <= stats.keys()

    assert await cache.get_redis().exists("dashboard:stats") == 1

    # Segunda chamada dentro do TTL vem do cache, mesmo com dados novos no banco.
    await api.post(
        "/service-orders",
        json={"clientId": str(client.id), "vehicleId": str(vehicle.id)},
        headers=admin,
    )
    cached = (await api.get("/dashboard/stats", headers=admin)).json()
    assert cached["totalServiceOrders"] == 1


async def test_dashboard_works_without_redis(api, admin, monkeypatch):
    from redis.exceptions import ConnectionError as RedisConnectionError

    class BrokenRedis:
        async def get(self, *_):
            raise RedisConnectionError("down")

        async def set(self, *_, **__):
            raise RedisConnectionError("down")

    monkeypatch.setattr(cache, "_redis", BrokenRedis())
    resp = await api.get("/dashboard/stats", headers=admin)
    assert resp.status_code == 200


async def test_health_reports_dependencies(api):
    resp = await api.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok", "database": "up", "redis": "up"}
