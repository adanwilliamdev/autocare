# 🚗 AutoCare

### Sistema de gestão para oficinas automotivas

O **AutoCare** é uma aplicação web para gerenciamento de oficinas automotivas, desenvolvida com arquitetura moderna e foco em **segurança, controle de acesso, integridade de dados e organização operacional**.

A plataforma centraliza processos como **ordens de serviço, orçamentos, clientes, veículos, estoque de peças e usuários**, oferecendo diferentes níveis de acesso conforme o papel de cada usuário.

---

## ✨ Funcionalidades

* 🔐 Autenticação com **JWT + Refresh Token**
* 🔄 Rotação de Refresh Tokens
* 👥 Controle de acesso baseado em papéis
* 🧑‍💼 Gerenciamento de usuários por administradores
* 📋 Gerenciamento de Ordens de Serviço
* 🧾 Criação e gerenciamento de orçamentos
* 🚗 Cadastro e gerenciamento de veículos
* 👤 Cadastro e gerenciamento de clientes
* 📦 Controle de estoque de peças
* 📊 Auditoria de movimentações de estoque
* 🔢 Numeração sequencial de Ordens de Serviço e Orçamentos
* 🔒 Controle de concorrência no estoque
* 🛡️ Proteção de rotas e operações por permissão
* 📱 Interface responsiva

---

## 👥 Controle de acesso

O sistema possui quatro níveis de acesso:

| Papel          | Acesso                               |
| -------------- | ------------------------------------ |
| `ADMIN`        | Acesso administrativo completo       |
| `MANAGER`      | Operações de gerenciamento           |
| `RECEPTIONIST` | Atendimento e operações de recepção  |
| `MECHANIC`     | Acesso às próprias Ordens de Serviço |

O cadastro público de usuários cria contas exclusivamente como `RECEPTIONIST`.

A criação de usuários com papéis elevados é restrita a administradores através da API administrativa.

### Regra específica para mecânicos

Usuários com papel `MECHANIC` podem visualizar somente as **Ordens de Serviço atribuídas a eles**, garantindo isolamento dos dados entre os profissionais.

---

## 🔐 Segurança

A autenticação utiliza **JWT Access Tokens** combinados com **Refresh Tokens com rotação**.

Principais mecanismos de segurança:

* Autenticação baseada em JWT
* Refresh Token com rotação
* Controle de acesso baseado em papéis
* Proteção de endpoints
* Validação de permissões no backend
* Auditoria baseada no usuário autenticado
* Controle de concorrência no estoque
* Prevenção de alterações realizadas em nome de outros usuários

A auditoria das movimentações de estoque utiliza exclusivamente o **usuário autenticado**, evitando que o cliente informe ou manipule a identidade responsável pela operação.

---

## 📦 Controle de estoque

O gerenciamento de estoque utiliza **lock otimista** através do campo `version`.

Operações como:

```text
add-stock
remove-stock
```

validam a versão atual do registro antes de realizar a alteração.

Em caso de concorrência, a atualização falha e a API retorna:

```http
409 Conflict
```

Isso evita problemas de **lost updates**, especialmente quando múltiplas operações modificam o mesmo item simultaneamente.

---

## 🔢 Numeração das Ordens de Serviço

Ordens de Serviço e Orçamentos possuem numeração controlada por um contador persistido no PostgreSQL.

A geração do próximo número ocorre de forma **atômica dentro de uma transação**, garantindo que operações concorrentes não produzam números duplicados.

---

## 🏗️ Arquitetura

O projeto é organizado em duas aplicações principais:

```text
AutoCare/
├── backend/
│   ├── src/
│   ├── prisma/
│   └── ...
│
└── frontend/
    ├── src/
    └── ...
```

### Backend

Responsável por:

* Regras de negócio
* Autenticação e autorização
* Persistência de dados
* Controle de estoque
* Ordens de Serviço
* Orçamentos
* Gerenciamento de usuários
* Auditoria
* API REST

### Frontend

Responsável por:

* Interface da aplicação
* Navegação
* Autenticação
* Controle de acesso
* Consumo da API
* Gerenciamento de estado
* Experiência do usuário

---

## 🛠️ Tecnologias

### Frontend

* **Next.js 14**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **React Query**
* **Axios**
* **Next.js App Router**

### Backend

* **Node.js**
* **NestJS**
* **TypeScript**
* **Prisma ORM**
* **PostgreSQL**
* **JWT**
* **Swagger**

---

## 🚀 Como executar

### Pré-requisitos

* Node.js
* npm
* PostgreSQL

### 1. Backend

```bash
cd backend
cp .env.example .env
```

Configure as variáveis de ambiente:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/autocare"
JWT_SECRET="your-secret"
CORS_ALLOWED_ORIGINS="http://localhost:3000"
```

Instale as dependências:

```bash
npm install
```

Execute as migrations:

```bash
npx prisma migrate dev --name init
```

Popule o banco com os dados iniciais:

```bash
npm run prisma:seed
```

Inicie o servidor:

```bash
npm run start:dev
```

A API estará disponível em:

```text
http://localhost:8080/api
```

### Swagger

A documentação da API está disponível em:

```text
http://localhost:8080/swagger-ui
```

---

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
```

Configure:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Instale as dependências:

```bash
npm install
```

Execute:

```bash
npm run dev
```

A aplicação estará disponível em:

```text
http://localhost:3000
```

---

## 🔑 Usuário inicial

O seed cria um usuário administrador para acesso inicial:

```text
Email: admin@autocare.com
Senha: admin123
Perfil: ADMIN
```

> ⚠️ Para ambientes reais, altere a senha padrão e utilize credenciais armazenadas de forma segura.

---

## 📡 API

A API segue uma arquitetura REST e possui endpoints organizados por domínio.

Exemplos:

```text
/api/auth
/api/users
/api/customers
/api/vehicles
/api/parts
/api/work-orders
/api/quotes
```

A documentação completa dos endpoints pode ser consultada através do Swagger.

---

## 📌 Principais decisões técnicas

### AuthGuard

O frontend utiliza um `AuthGuard` para proteger páginas e controlar o redirecionamento conforme o estado de autenticação e o papel do usuário.

### React Query

O gerenciamento das requisições à API utiliza **React Query**, permitindo controle de:

* Cache
* Estados de carregamento
* Refetch
* Invalidação de dados
* Tratamento de requisições assíncronas

### Prisma

O Prisma é utilizado como ORM para acesso ao PostgreSQL, incluindo transações para operações que exigem consistência entre múltiplas alterações.

### Transações

Operações críticas, como geração de identificadores e movimentações de estoque, utilizam transações para preservar a integridade dos dados.

---

## 📈 Objetivos técnicos

O projeto foi desenvolvido com foco em práticas comuns no desenvolvimento de aplicações backend profissionais:

* Arquitetura modular
* Separação de responsabilidades
* API REST
* Autenticação e autorização
* Controle de concorrência
* Transações
* Integridade de dados
* Auditoria
* Validação de dados
* Documentação de API
* Controle de acesso baseado em papéis

---

## 📄 Licença

Este projeto está disponível sob a licença **MIT**.
