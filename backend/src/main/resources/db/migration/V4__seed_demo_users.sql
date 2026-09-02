-- Usuários de demonstração (ambiente de desenvolvimento apenas).
-- Senha para todos: admin123 (hash BCrypt abaixo).
-- ATENÇÃO: nunca utilize estas credenciais em produção.

INSERT INTO users (id, name, email, password, role, created_at, updated_at, is_active)
VALUES
    (gen_random_uuid()::text, 'Administrador', 'admin@autocare.com',
     '$2b$10$CTq3H.aebMepGLM3xrxVR.ruk/a8OM1MJZyWdYdLCMzc865JMu/2W',
     'ADMIN', now(), now(), true),
    (gen_random_uuid()::text, 'Gerente', 'manager@autocare.com',
     '$2b$10$CTq3H.aebMepGLM3xrxVR.ruk/a8OM1MJZyWdYdLCMzc865JMu/2W',
     'MANAGER', now(), now(), true),
    (gen_random_uuid()::text, 'Recepcionista', 'receptionist@autocare.com',
     '$2b$10$CTq3H.aebMepGLM3xrxVR.ruk/a8OM1MJZyWdYdLCMzc865JMu/2W',
     'RECEPTIONIST', now(), now(), true),
    (gen_random_uuid()::text, 'Mecânico', 'mechanic@autocare.com',
     '$2b$10$CTq3H.aebMepGLM3xrxVR.ruk/a8OM1MJZyWdYdLCMzc865JMu/2W',
     'MECHANIC', now(), now(), true)
ON CONFLICT (email) DO NOTHING;
