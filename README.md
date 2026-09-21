# 🚗 AutoCare

Sistema de gestão para oficinas mecânicas: clientes, veículos, mecânicos, estoque de peças, orçamentos e ordens de serviço, com acesso por perfil (`ADMIN`, `MANAGER`, `RECEPTIONIST`, `MECHANIC`).

## Arquitetura

```
Frontend   Next.js 16 · TypeScript · Tailwind CSS 4 · shadcn/ui · TanStack Query
   ↓ REST API (JSON, JWT)
Backend    Python 3.12+ · FastAPI · Pydantic · SQLAlchemy 2 (async) · Alembic
   ↓
PostgreSQL 16 · Redis 7
```

| Camada | Detalhes |
| --- | --- |
| Frontend | App Router, formulários com react-hook-form + zod, tabelas/diálogos com shadcn/ui, cache e mutações com TanStack Query |
| Backend | Rotas finas em `app/api`, regras de negócio em `app/services`, models em `app/models`, schemas Pydantic em `app/schemas` |
| PostgreSQL | Fonte de dados. Numeração de OS/orçamento por *sequences* nativas; estoque com lock otimista (`version`) |
| Redis | Cache do dashboard e rate limit do login. **Opcional em runtime**: se cair, a API segue funcionando sem cache/limite |

## Estrutura

```
autocare/
├── backend/
│   ├── app/{api,core,db,models,schemas,services,scripts}
│   ├── alembic/            # migrations
│   └── tests/              # pytest (PostgreSQL real + fakeredis)
├── frontend/
│   └── src/{app,components,features,lib,types}
└── docker-compose.yml
```

## Como executar

### Tudo com Docker

```bash
docker compose up -d --build
docker compose exec api python -m app.scripts.seed   # cria o admin
```

Web: http://localhost:3000 · API: http://localhost:8080/api · Swagger: http://localhost:8080/api/swagger-ui

### Desenvolvimento

```bash
docker compose up -d postgres redis          # só a infraestrutura

# Backend (Python 3.12+)
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
alembic upgrade head
python -m app.scripts.seed
uvicorn app.main:app --reload --port 8080

# Frontend (Node 20.9+), em outro terminal
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Usuário de demonstração criado pelo seed: `admin@autocare.com` / `admin123` (defina `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` fora de desenvolvimento).

### Testes e qualidade

```bash
cd backend
createdb autocare_test    # ou: docker compose exec postgres createdb -U postgres autocare_test
pytest                    # 91 testes: permissões, estoque concorrente, OS, orçamentos, auth...
ruff check . && ruff format --check .

cd ../frontend
npm run typecheck && npm run lint && npm run build
```

`TEST_DATABASE_URL` aponta o banco dos testes (padrão: `postgresql+asyncpg://postgres:postgres@localhost:5432/autocare_test`). Os testes aplicam as migrations do Alembic.

## Perfis de acesso

| Perfil | Pode |
| --- | --- |
| `ADMIN` | Tudo, inclusive criar usuários com qualquer papel (`POST /api/auth/users`) |
| `MANAGER` | Dashboard, mecânicos, estoque, aprovar/recusar orçamentos, alterar status de OS; só consulta clientes/veículos/orçamentos |
| `RECEPTIONIST` | Clientes, veículos, criar OS e orçamentos; consulta mecânicos |
| `MECHANIC` | Só as OS atribuídas a ele (`GET /api/service-orders/mine`, ver e mudar status) |

O autocadastro (`POST /api/auth/register`) sempre cria `RECEPTIONIST`. As regras são aplicadas na API (`require_roles`); o frontend só esconde o que a API negaria (`lib/navigation.ts`).

## Segurança

- JWT de acesso + refresh token **com rotação**; o refresh token é guardado como SHA-256 no banco, nunca em texto puro.
- `bcrypt` executado fora do event loop; login com mesma mensagem e mesmo custo de CPU para e-mail inexistente.
- Rate limit de login por IP + e-mail (`LOGIN_RATE_LIMIT_*`) → `429`.
- Usuário é relido do banco a cada requisição: desativar uma conta ou mudar o papel vale imediatamente.
- Auditoria de estoque sempre com o usuário do token (nenhum `userId` vem do cliente).
- Em `ENVIRONMENT=production` a API não sobe com `JWT_SECRET` fraco ou de exemplo.

## Variáveis de ambiente

Backend (`backend/.env.example`): `DATABASE_URL` (aceita `postgresql://` e `postgres://`), `REDIS_URL`, `JWT_SECRET`, `JWT_EXPIRATION_MS`, `REFRESH_TOKEN_DAYS`, `CORS_ALLOWED_ORIGINS`, `LOGIN_RATE_LIMIT_ATTEMPTS`, `LOGIN_RATE_LIMIT_WINDOW_SECONDS`, `DASHBOARD_CACHE_TTL_SECONDS`.

Frontend (`frontend/.env.example`): `NEXT_PUBLIC_API_URL` (inclui `/api`; é embutida no build).

## Diferenças em relação à versão NestJS/Prisma

**Contrato da API** (mesmas rotas e formatos em camelCase, com estas exceções):

- Erros de validação retornam **422** com `{ status, errors: [...] }` (antes 400). Regras de negócio continuam 400, conflitos 409.
- Valores monetários agora saem como **números JSON** (o Prisma serializava `Decimal` como string, o que quebrava a formatação em R$ na tela).
- IDs malformados retornam 422 (antes caíam no banco e davam 404).
- `add-stock`/`remove-stock`: o parâmetro `userId` foi removido (já era ignorado pelo servidor).
- `PUT` de cliente/veículo/mecânico: campo omitido é mantido; `null` explícito limpa o campo.
- Novos: `GET /api/health` e `GET /api/service-orders/mine`.

**Banco**: schema novo, criado pelo Alembic — não é compatível com o do Prisma (`password` → `password_hash`, refresh tokens em hash, tabela `counters` → sequences, UUID nativo, `timestamptz`). Não há script de migração de dados.

**Frontend**: `axios` → `fetch` com renovação de token em fluxo único; `AuthGuard`/`Layout` por página → um único `AppShell`; `window.confirm` → diálogos; menu lateral vira gaveta no mobile; o cache do TanStack Query é limpo em login/logout; nova ação "Entrada/Saída de estoque" (a API existia, mas não tinha tela).

## Pendências herdadas (não alteradas)

- `GET /api/dashboard/stats`: faturamento mensal, gráfico, "mecânicos mais ativos" e "peças mais usadas" continuam **valores fixos**, como no original (`app/services/dashboard.py::_placeholder_sections`). `service_orders.total_amount` nunca é preenchido e não há vínculo entre OS e peças usadas; falta definir o modelo de faturamento antes de trocar por consultas reais.
- O token de acesso dura 24 h por padrão (`JWT_EXPIRATION_MS`); com refresh token, vale considerar algo bem menor.
- Tokens ficam em `localStorage` (como antes). Para reduzir o risco de XSS, o próximo passo seria cookies `HttpOnly` via rota do Next.js.
