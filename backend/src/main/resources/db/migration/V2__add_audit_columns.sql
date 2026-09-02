-- Adicionar colunas de auditoria

-- Adicionar colunas de auditoria em clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS created_by VARCHAR(36);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_by VARCHAR(36);

-- Adicionar colunas de auditoria em vehicles
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS created_by VARCHAR(36);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS updated_by VARCHAR(36);

-- Adicionar colunas de auditoria em service_orders
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS created_by VARCHAR(36);
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS updated_by VARCHAR(36);

-- Adicionar coluna de descrição em inventory_movements
ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS description TEXT;