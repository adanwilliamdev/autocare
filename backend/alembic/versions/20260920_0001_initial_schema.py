"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-09-20 15:22:41.521761
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Sequences não são detectadas pelo autogenerate: numeração atômica de OS e orçamentos.
    op.execute("CREATE SEQUENCE service_order_number_seq")
    op.execute("CREATE SEQUENCE budget_number_seq")

    op.create_table(
        "clients",
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("cpf", sa.String(), nullable=True),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("address", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_clients")),
        sa.UniqueConstraint("cpf", name=op.f("uq_clients_cpf")),
    )
    op.create_table(
        "parts",
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("code", sa.String(), nullable=False),
        sa.Column("manufacturer", sa.String(), nullable=True),
        sa.Column("purchase_price", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("sale_price", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("stock_quantity", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("minimum_stock", sa.Integer(), server_default=sa.text("5"), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("version", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint("stock_quantity >= 0", name=op.f("ck_parts_stock_non_negative")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_parts")),
        sa.UniqueConstraint("code", name=op.f("uq_parts_code")),
    )
    op.create_table(
        "users",
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column(
            "role",
            sa.Enum("ADMIN", "RECEPTIONIST", "MECHANIC", "MANAGER", name="role"),
            nullable=False,
        ),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
        sa.UniqueConstraint("email", name=op.f("uq_users_email")),
    )
    op.create_table(
        "inventory_movements",
        sa.Column("part_id", sa.Uuid(), nullable=False),
        sa.Column(
            "type", sa.Enum("ENTRADA", "SAIDA", "AJUSTE", name="movement_type"), nullable=False
        ),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("previous_quantity", sa.Integer(), nullable=False),
        sa.Column("current_quantity", sa.Integer(), nullable=False),
        sa.Column("reason", sa.String(), nullable=True),
        sa.Column("reference_id", sa.String(), nullable=True),
        sa.Column("user_id", sa.Uuid(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.ForeignKeyConstraint(
            ["part_id"], ["parts.id"], name=op.f("fk_inventory_movements_part_id_parts")
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_inventory_movements_user_id_users"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_inventory_movements")),
    )
    op.create_index(
        op.f("ix_inventory_movements_part_id"), "inventory_movements", ["part_id"], unique=False
    )
    op.create_table(
        "mechanics",
        sa.Column("user_id", sa.Uuid(), nullable=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("specialty", sa.String(), nullable=True),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("is_available", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name=op.f("fk_mechanics_user_id_users"), ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_mechanics")),
        sa.UniqueConstraint("user_id", name=op.f("uq_mechanics_user_id")),
    )
    op.create_table(
        "refresh_tokens",
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_refresh_tokens_user_id_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_refresh_tokens")),
        sa.UniqueConstraint("token_hash", name=op.f("uq_refresh_tokens_token_hash")),
    )
    op.create_index(op.f("ix_refresh_tokens_user_id"), "refresh_tokens", ["user_id"], unique=False)
    op.create_table(
        "vehicles",
        sa.Column("plate", sa.String(), nullable=False),
        sa.Column("brand", sa.String(), nullable=False),
        sa.Column("model", sa.String(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("mileage", sa.Integer(), nullable=True),
        sa.Column("fuel_type", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("client_id", sa.Uuid(), nullable=False),
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["client_id"], ["clients.id"], name=op.f("fk_vehicles_client_id_clients")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_vehicles")),
        sa.UniqueConstraint("plate", name=op.f("uq_vehicles_plate")),
    )
    op.create_index(op.f("ix_vehicles_client_id"), "vehicles", ["client_id"], unique=False)
    op.create_table(
        "service_orders",
        sa.Column("order_number", sa.String(), nullable=False),
        sa.Column("client_id", sa.Uuid(), nullable=False),
        sa.Column("vehicle_id", sa.Uuid(), nullable=False),
        sa.Column("mechanic_id", sa.Uuid(), nullable=True),
        sa.Column("reported_problem", sa.String(), nullable=True),
        sa.Column("diagnosis", sa.String(), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "CRIADA",
                "EM_DIAGNOSTICO",
                "AGUARDANDO_APROVACAO",
                "APROVADA",
                "EM_EXECUCAO",
                "FINALIZADA",
                "CANCELADA",
                name="service_order_status",
            ),
            server_default="CRIADA",
            nullable=False,
        ),
        sa.Column(
            "total_amount",
            sa.Numeric(precision=12, scale=2),
            server_default=sa.text("0"),
            nullable=False,
        ),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["client_id"], ["clients.id"], name=op.f("fk_service_orders_client_id_clients")
        ),
        sa.ForeignKeyConstraint(
            ["mechanic_id"], ["mechanics.id"], name=op.f("fk_service_orders_mechanic_id_mechanics")
        ),
        sa.ForeignKeyConstraint(
            ["vehicle_id"], ["vehicles.id"], name=op.f("fk_service_orders_vehicle_id_vehicles")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_service_orders")),
        sa.UniqueConstraint("order_number", name=op.f("uq_service_orders_order_number")),
    )
    op.create_index(
        op.f("ix_service_orders_client_id"), "service_orders", ["client_id"], unique=False
    )
    op.create_index(
        op.f("ix_service_orders_mechanic_id"), "service_orders", ["mechanic_id"], unique=False
    )
    op.create_index(op.f("ix_service_orders_status"), "service_orders", ["status"], unique=False)
    op.create_index(
        op.f("ix_service_orders_vehicle_id"), "service_orders", ["vehicle_id"], unique=False
    )
    op.create_table(
        "budgets",
        sa.Column("budget_number", sa.String(), nullable=False),
        sa.Column("client_id", sa.Uuid(), nullable=False),
        sa.Column("vehicle_id", sa.Uuid(), nullable=False),
        sa.Column("service_order_id", sa.Uuid(), nullable=True),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("total_amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column(
            "status",
            sa.Enum("PENDENTE", "APROVADO", "RECUSADO", "EXPIRADO", name="budget_status"),
            server_default="PENDENTE",
            nullable=False,
        ),
        sa.Column("valid_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["client_id"], ["clients.id"], name=op.f("fk_budgets_client_id_clients")
        ),
        sa.ForeignKeyConstraint(
            ["service_order_id"],
            ["service_orders.id"],
            name=op.f("fk_budgets_service_order_id_service_orders"),
        ),
        sa.ForeignKeyConstraint(
            ["vehicle_id"], ["vehicles.id"], name=op.f("fk_budgets_vehicle_id_vehicles")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_budgets")),
        sa.UniqueConstraint("budget_number", name=op.f("uq_budgets_budget_number")),
        sa.UniqueConstraint("service_order_id", name=op.f("uq_budgets_service_order_id")),
    )
    op.create_index(op.f("ix_budgets_client_id"), "budgets", ["client_id"], unique=False)
    op.create_index(op.f("ix_budgets_status"), "budgets", ["status"], unique=False)
    op.create_index(op.f("ix_budgets_vehicle_id"), "budgets", ["vehicle_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_budgets_vehicle_id"), table_name="budgets")
    op.drop_index(op.f("ix_budgets_status"), table_name="budgets")
    op.drop_index(op.f("ix_budgets_client_id"), table_name="budgets")
    op.drop_table("budgets")
    op.drop_index(op.f("ix_service_orders_vehicle_id"), table_name="service_orders")
    op.drop_index(op.f("ix_service_orders_status"), table_name="service_orders")
    op.drop_index(op.f("ix_service_orders_mechanic_id"), table_name="service_orders")
    op.drop_index(op.f("ix_service_orders_client_id"), table_name="service_orders")
    op.drop_table("service_orders")
    op.drop_index(op.f("ix_vehicles_client_id"), table_name="vehicles")
    op.drop_table("vehicles")
    op.drop_index(op.f("ix_refresh_tokens_user_id"), table_name="refresh_tokens")
    op.drop_table("refresh_tokens")
    op.drop_table("mechanics")
    op.drop_index(op.f("ix_inventory_movements_part_id"), table_name="inventory_movements")
    op.drop_table("inventory_movements")
    op.drop_table("users")
    op.drop_table("parts")
    op.drop_table("clients")

    op.execute("DROP SEQUENCE budget_number_seq")
    op.execute("DROP SEQUENCE service_order_number_seq")
    for enum_name in ("budget_status", "service_order_status", "movement_type", "role"):
        op.execute(f"DROP TYPE {enum_name}")
