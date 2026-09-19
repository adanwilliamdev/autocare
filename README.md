# AutoCare — Next.js + NestJS (convertido)

Conversão completa do projeto original **React/Vite + Java Spring Boot** para:

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind
- **Backend**: Node.js + NestJS + Prisma + PostgreSQL

A lógica de negócio e as regras de permissão (por papel: ADMIN, MANAGER,
RECEPTIONIST, MECHANIC) foram preservadas 1:1 em relação ao backend Java original,
incluindo:

- Autenticação JWT + refresh token com rotação
- Autocadastro sempre como RECEPTIONIST; papéis elevados só via ADMIN (`POST /auth/users`)
- Auditoria de estoque sempre a partir do usuário autenticado (nunca de parâmetro do cliente)
- Lock otimista no estoque de peças (campo `version`) para evitar *lost updates* em `add-stock`/`remove-stock`
- Numeração atômica de Ordens de Serviço/Orçamentos via contador em transação
- Restrição de MECHANIC a ver apenas as próprias ordens de serviço

## Estrutura

```
backend/    # NestJS + Prisma
frontend/   # Next.js App Router
```

## Como rodar

### 1. Backend

```bash
cd backend
cp .env.example .env      # ajuste DATABASE_URL, JWT_SECRET, CORS_ALLOWED_ORIGINS
npm install
npx prisma migrate dev --name init
npm run prisma:seed       # cria admin@autocare.com / admin123
npm run start:dev
```

A API sobe em `http://localhost:8080/api` (Swagger em `/swagger-ui`).

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8080/api
npm install
npm run dev
```

Acesse `http://localhost:3000` e entre com `admin@autocare.com` / `admin123`.

## Observações da conversão

- O frontend manteve a arquitetura de SPA client-rendered (React Query + axios +
  token em `localStorage`), apenas trocando o roteamento de `react-router-dom` para
  o App Router do Next (`next/navigation`, `next/link`). Isso preserva exatamente o
  mesmo modelo de autenticação/autorização do app original, sem introduzir Server
  Components/Server Actions na camada de auth — uma reescrita nesse sentido mudaria
  o modelo de segurança e não fazia parte do escopo pedido.
- `PrivateRoute` virou `AuthGuard` (`src/lib/AuthGuard.tsx`), com a mesma lógica de
  redirecionamento por papel.
- Sequences nativas do Postgres (`nextval`) viraram uma tabela `Counter` incrementada
  atomicamente dentro de uma transação Prisma.
- `@Version`/lock otimista do Hibernate virou um `UPDATE ... WHERE id = ? AND version = ?`
  dentro de uma transação Prisma, com `ConflictException` (409) se 0 linhas forem afetadas.
