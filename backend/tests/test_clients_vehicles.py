import uuid


async def test_client_crud_and_soft_delete(api, admin):
    created = await api.post(
        "/clients", json={"name": "João", "cpf": "111", "email": "j@x.com"}, headers=admin
    )
    assert created.status_code == 201
    client = created.json()
    assert client["vehicleCount"] == 0 and client["isActive"] is True

    assert (await api.delete(f"/clients/{client['id']}", headers=admin)).status_code == 204
    assert (await api.get("/clients", headers=admin)).json() == []

    assert (await api.patch(f"/clients/{client['id']}/activate", headers=admin)).status_code == 204
    assert len((await api.get("/clients", headers=admin)).json()) == 1


async def test_client_update_keeps_omitted_fields_and_clears_explicit_null(api, admin):
    created = (
        await api.post(
            "/clients", json={"name": "Ana", "cpf": "222", "phone": "1199"}, headers=admin
        )
    ).json()

    resp = await api.put(f"/clients/{created['id']}", json={"name": "Ana Maria"}, headers=admin)
    assert resp.json()["name"] == "Ana Maria"
    assert resp.json()["cpf"] == "222"

    resp = await api.put(
        f"/clients/{created['id']}", json={"name": "Ana Maria", "cpf": None}, headers=admin
    )
    assert resp.json()["cpf"] is None
    assert resp.json()["phone"] == "1199"


async def test_duplicate_cpf_is_a_conflict(api, admin):
    await api.post("/clients", json={"name": "A", "cpf": "333"}, headers=admin)
    resp = await api.post("/clients", json={"name": "B", "cpf": "333"}, headers=admin)
    assert resp.status_code == 409


async def test_client_search_is_case_insensitive(api, admin):
    await api.post("/clients", json={"name": "Carlos Eduardo"}, headers=admin)
    await api.post("/clients", json={"name": "Beatriz"}, headers=admin)
    resp = await api.get("/clients/search", params={"name": "carlos"}, headers=admin)
    assert [c["name"] for c in resp.json()] == ["Carlos Eduardo"]


async def test_invalid_uuid_and_missing_client(api, admin):
    assert (await api.get("/clients/nao-e-uuid", headers=admin)).status_code == 422
    resp = await api.get(f"/clients/{uuid.uuid4()}", headers=admin)
    assert resp.status_code == 404
    assert resp.json()["message"].startswith("Cliente não encontrado com ID:")


async def test_vehicle_plate_is_normalized_and_validated(api, admin, client_and_vehicle):
    client, _ = client_and_vehicle
    base = {"brand": "Fiat", "model": "Uno", "year": 2015, "clientId": str(client.id)}

    ok = await api.post("/vehicles", json={**base, "plate": "xyz-9k88"}, headers=admin)
    assert ok.status_code == 201
    assert ok.json()["plate"] == "XYZ9K88"
    assert ok.json()["clientName"] == "Maria Souza"

    bad = await api.post("/vehicles", json={**base, "plate": "123"}, headers=admin)
    assert bad.status_code == 422


async def test_duplicate_plate_is_rejected(api, admin, client_and_vehicle):
    client, vehicle = client_and_vehicle
    resp = await api.post(
        "/vehicles",
        json={
            "plate": vehicle.plate,
            "brand": "VW",
            "model": "Gol",
            "year": 2020,
            "clientId": str(client.id),
        },
        headers=admin,
    )
    assert resp.status_code == 400
    assert "placa" in resp.json()["message"]


async def test_vehicles_by_client_and_client_vehicle_count(api, admin, client_and_vehicle):
    client, _ = client_and_vehicle
    vehicles = await api.get(f"/vehicles/client/{client.id}", headers=admin)
    assert [v["plate"] for v in vehicles.json()] == ["ABC1D23"]

    clients = await api.get("/clients", headers=admin)
    assert clients.json()[0]["vehicleCount"] == 1


async def test_update_mileage(api, admin, client_and_vehicle):
    _, vehicle = client_and_vehicle
    resp = await api.patch(
        f"/vehicles/{vehicle.id}/mileage", params={"mileage": 55000}, headers=admin
    )
    assert resp.status_code == 204
    assert (await api.get(f"/vehicles/{vehicle.id}", headers=admin)).json()["mileage"] == 55000
    resp = await api.patch(f"/vehicles/{vehicle.id}/mileage", params={"mileage": -1}, headers=admin)
    assert resp.status_code == 422
