"""Matriz de permissões: quem pode (ou não) chamar cada endpoint."""

import uuid

import pytest

from app.models import Role

ADMIN, MANAGER, RECEPTIONIST, MECHANIC = (
    Role.ADMIN,
    Role.MANAGER,
    Role.RECEPTIONIST,
    Role.MECHANIC,
)
ID = uuid.uuid4()

# (método, caminho, corpo, papéis permitidos)
ENDPOINTS = [
    ("GET", "/clients", None, {ADMIN, RECEPTIONIST, MANAGER}),
    ("POST", "/clients", {"name": "X"}, {ADMIN, RECEPTIONIST}),
    ("DELETE", f"/clients/{ID}", None, {ADMIN, RECEPTIONIST}),
    ("GET", "/vehicles", None, {ADMIN, RECEPTIONIST, MANAGER, MECHANIC}),
    ("PATCH", f"/vehicles/{ID}/mileage?mileage=10", None, {ADMIN, RECEPTIONIST, MECHANIC}),
    ("DELETE", f"/vehicles/{ID}", None, {ADMIN, RECEPTIONIST}),
    ("GET", "/mechanics", None, {ADMIN, MANAGER, RECEPTIONIST}),
    ("DELETE", f"/mechanics/{ID}", None, {ADMIN, MANAGER}),
    ("GET", "/inventory/parts", None, {ADMIN, MANAGER}),
    ("POST", f"/inventory/parts/{ID}/add-stock?quantity=1", None, {ADMIN, MANAGER}),
    ("GET", "/service-orders", None, {ADMIN, MANAGER, RECEPTIONIST}),
    ("GET", "/service-orders/mine", None, {MECHANIC}),
    ("GET", f"/service-orders/{ID}", None, {ADMIN, MANAGER, RECEPTIONIST, MECHANIC}),
    ("PATCH", f"/service-orders/{ID}/status", {"status": "CANCELADA"}, {ADMIN, MANAGER, MECHANIC}),
    (
        "PATCH",
        f"/service-orders/{ID}/mechanic?mechanicId={ID}",
        None,
        {ADMIN, MANAGER, RECEPTIONIST},
    ),
    ("GET", "/budgets", None, {ADMIN, RECEPTIONIST, MANAGER}),
    ("PATCH", f"/budgets/{ID}/approve", None, {ADMIN, MANAGER}),
    ("GET", "/dashboard/stats", None, {ADMIN, MANAGER}),
]


@pytest.mark.parametrize("method,path,body,allowed", ENDPOINTS, ids=lambda v: str(v)[:40])
async def test_role_matrix(api, headers_for, method, path, body, allowed):
    for role in Role:
        headers = await headers_for(role)
        resp = await api.request(method, path, json=body, headers=headers)
        if role in allowed:
            assert resp.status_code != 403, f"{role} deveria poder {method} {path}"
        else:
            assert resp.status_code == 403, f"{role} não deveria poder {method} {path}"


@pytest.mark.parametrize("method,path,body,_", ENDPOINTS, ids=lambda v: str(v)[:40])
async def test_every_endpoint_requires_authentication(api, method, path, body, _):
    resp = await api.request(method, path, json=body)
    assert resp.status_code == 401
