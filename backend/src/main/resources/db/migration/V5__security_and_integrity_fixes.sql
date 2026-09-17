-- V5: suporte às correções de segurança e integridade de dados
-- (lock otimista em parts, vínculo mechanic->user, refresh tokens,
-- geração atômica do número da OS)

-- 1) Lock otimista para evitar "lost update" em movimentações de estoque concorrentes
ALTER TABLE parts ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- 2) Vínculo entre um perfil de mecânico e sua conta de login (users.role = MECHANIC),
-- necessário para restringir cada mecânico às suas próprias ordens de serviço
ALTER TABLE mechanics ADD COLUMN IF NOT EXISTS user_id VARCHAR(36);

ALTER TABLE mechanics
    ADD CONSTRAINT fk_mechanics_user
    FOREIGN KEY (user_id) REFERENCES users(id);

-- Único por usuário (mas permite múltiplos NULLs, para mecânicos sem conta de login)
CREATE UNIQUE INDEX IF NOT EXISTS idx_mechanics_user_id
    ON mechanics(user_id)
    WHERE user_id IS NOT NULL;

-- Vincula o mecânico de demonstração (seed V4) à sua conta de login, para que o
-- ambiente de demo já funcione com a restrição de acesso por mecânico habilitada
INSERT INTO mechanics (id, name, specialty, phone, user_id, is_available, is_active, created_at, updated_at)
SELECT gen_random_uuid()::text, 'Mecânico Demo', 'Geral', '(00) 00000-0000', u.id, true, true, now(), now()
FROM users u
WHERE u.email = 'mechanic@autocare.com'
  AND NOT EXISTS (SELECT 1 FROM mechanics m WHERE m.user_id = u.id);

-- 3) Tabela de refresh tokens (rotação de token, sem obrigar novo login a cada 24h)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    token VARCHAR(512) NOT NULL UNIQUE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- 4) Sequence para gerar o número da OS de forma atômica.
-- Antes o código usava "SELECT count(*) + 1", que não é seguro sob concorrência:
-- duas OS criadas ao mesmo tempo podiam calcular o mesmo próximo número.
-- Iniciamos a sequence a partir da quantidade de OS já existentes, para não colidir
-- com números já emitidos em bases que já têm dados.
CREATE SEQUENCE IF NOT EXISTS service_order_number_seq
    START WITH 1
    INCREMENT BY 1;

SELECT setval(
    'service_order_number_seq',
    GREATEST((SELECT COUNT(*) FROM service_orders), 0) + 1,
    false
);
