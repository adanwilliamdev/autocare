import asyncio
import uuid

import pytest
from sqlalchemy import func, select, text

from app.core.exceptions import OptimisticLockError
from app.models import InventoryMovement, Part
from app.services import inventory as inventory_service

PART = {
    "name": "Filtro de óleo",
    "code": "FO-100",
    "manufacturer": "Mann",
    "purchasePrice": 10.5,
    "salePrice": 25.9,
    "stockQuantity": 10,
    "minimumStock": 3,
}


async def create_part(api, headers, **overrides):
    resp = await api.post("/inventory/parts", json={**PART, **overrides}, headers=headers)
    assert resp.status_code == 201, resp.text
    return resp.json()


async def test_create_part_returns_numbers_and_records_initial_movement(api, admin, session):
    part = await create_part(api, admin)
    assert part["salePrice"] == 25.9 and isinstance(part["purchasePrice"], float)
    assert part["isLowStock"] is False

    movements = (await api.get(f"/inventory/parts/{part['id']}/movements", headers=admin)).json()
    assert len(movements) == 1
    assert movements[0]["reason"] == "Cadastro inicial"
    assert movements[0]["type"] == "ENTRADA"
    assert movements[0]["userId"] is not None


async def test_duplicate_code_is_rejected(api, admin):
    await create_part(api, admin)
    resp = await api.post("/inventory/parts", json=PART, headers=admin)
    assert resp.status_code == 400
    assert "código" in resp.json()["message"]


async def test_prices_must_be_positive_with_two_decimals(api, admin):
    resp = await api.post("/inventory/parts", json={**PART, "salePrice": 0}, headers=admin)
    assert resp.status_code == 422
    resp = await api.post("/inventory/parts", json={**PART, "salePrice": 1.999}, headers=admin)
    assert resp.status_code == 422


async def test_add_and_remove_stock_are_audited_with_the_authenticated_user(api, admin, session):
    part = await create_part(api, admin)
    pid = part["id"]

    assert (
        await api.post(
            f"/inventory/parts/{pid}/add-stock",
            params={"quantity": 5, "reason": "compra"},
            headers=admin,
        )
    ).status_code == 204
    assert (
        await api.post(
            f"/inventory/parts/{pid}/remove-stock",
            params={"quantity": 2, "reason": "venda"},
            headers=admin,
        )
    ).status_code == 204

    assert (await api.get(f"/inventory/parts/{pid}", headers=admin)).json()["stockQuantity"] == 13
    history = (await api.get(f"/inventory/parts/{pid}/movements", headers=admin)).json()
    assert [
        (m["type"], m["quantity"], m["previousQuantity"], m["currentQuantity"]) for m in history
    ] == [
        ("SAIDA", 2, 15, 13),
        ("ENTRADA", 5, 10, 15),
        ("ENTRADA", 10, 0, 10),
    ]


async def test_client_supplied_user_id_is_ignored(api, admin):
    part = await create_part(api, admin)
    forged = str(uuid.uuid4())
    await api.post(
        f"/inventory/parts/{part['id']}/add-stock",
        params={"quantity": 1, "userId": forged},
        headers=admin,
    )
    history = (await api.get(f"/inventory/parts/{part['id']}/movements", headers=admin)).json()
    assert history[0]["userId"] != forged


async def test_cannot_remove_more_than_available(api, admin):
    part = await create_part(api, admin, stockQuantity=2)
    resp = await api.post(
        f"/inventory/parts/{part['id']}/remove-stock", params={"quantity": 3}, headers=admin
    )
    assert resp.status_code == 400
    assert resp.json()["message"] == "Estoque insuficiente. Disponível: 2"
    assert (await api.get(f"/inventory/parts/{part['id']}", headers=admin)).json()[
        "stockQuantity"
    ] == 2


async def test_quantity_must_be_positive(api, admin):
    part = await create_part(api, admin)
    resp = await api.post(
        f"/inventory/parts/{part['id']}/add-stock", params={"quantity": 0}, headers=admin
    )
    assert resp.status_code == 422


async def test_low_stock_listing_and_flag(api, admin):
    await create_part(api, admin, code="A", stockQuantity=1, minimumStock=5)
    await create_part(api, admin, code="B", stockQuantity=50, minimumStock=5)
    low = (await api.get("/inventory/parts/low-stock", headers=admin)).json()
    assert [p["code"] for p in low] == ["A"]
    assert low[0]["isLowStock"] is True


async def test_editing_a_part_never_changes_its_stock(api, admin):
    part = await create_part(api, admin)
    resp = await api.put(
        f"/inventory/parts/{part['id']}",
        json={**PART, "name": "Novo nome", "stockQuantity": 999},
        headers=admin,
    )
    assert resp.json()["name"] == "Novo nome"
    assert resp.json()["stockQuantity"] == 10


async def test_soft_deleted_parts_disappear_from_the_list(api, admin):
    part = await create_part(api, admin)
    assert (await api.delete(f"/inventory/parts/{part['id']}", headers=admin)).status_code == 204
    assert (await api.get("/inventory/parts", headers=admin)).json() == []


async def test_stale_version_raises_optimistic_lock_error(api, admin, session, monkeypatch):
    part = await create_part(api, admin)
    pid = uuid.UUID(part["id"])
    stale = await session.get(Part, pid)

    # Outra requisição altera a peça depois da nossa leitura.
    await session.execute(
        text("UPDATE parts SET version = version + 1 WHERE id = :id"), {"id": pid}
    )
    await session.commit()

    async def return_stale(*_):
        return stale

    monkeypatch.setattr(inventory_service, "get_part", return_stale)
    with pytest.raises(OptimisticLockError):
        await inventory_service.add_stock(session, pid, 1, "teste", uuid.uuid4())


async def test_concurrent_removals_never_oversell_or_lose_updates(api, admin, session):
    initial = 5
    part = await create_part(api, admin, stockQuantity=initial)
    pid = part["id"]

    responses = await asyncio.gather(
        *(
            api.post(
                f"/inventory/parts/{pid}/remove-stock",
                params={"quantity": 1, "reason": "corrida"},
                headers=admin,
            )
            for _ in range(12)
        )
    )
    codes = [r.status_code for r in responses]
    assert set(codes) <= {204, 409, 400}

    succeeded = codes.count(204)
    assert 1 <= succeeded <= initial

    final = (await api.get(f"/inventory/parts/{pid}", headers=admin)).json()["stockQuantity"]
    assert final == initial - succeeded  # nenhuma atualização perdida
    assert final >= 0  # nunca vendeu mais do que tinha

    removals = await session.scalar(
        select(func.count())
        .select_from(InventoryMovement)
        .where(InventoryMovement.reason == "corrida")
    )
    assert removals == succeeded  # cada baixa bem-sucedida gerou exatamente uma movimentação
