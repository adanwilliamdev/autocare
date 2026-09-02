-- Índices adicionais para performance

-- Índice composto para ordens de serviço
CREATE INDEX IF NOT EXISTS idx_service_orders_client_status
ON service_orders(client_id, status);

-- Índice para busca de orçamentos
CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(status);
CREATE INDEX IF NOT EXISTS idx_budgets_created_at ON budgets(created_at);

-- Índice para peças
CREATE INDEX IF NOT EXISTS idx_parts_name ON parts(name);
CREATE INDEX IF NOT EXISTS idx_parts_code ON parts(code);

-- Índice para movimentações
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created
ON inventory_movements(created_at DESC);