# 🚗 AutoCare

Sistema completo de gestão para oficinas mecânicas, desenvolvido com arquitetura moderna e foco em **segurança, controle operacional e gerenciamento de ordens de serviço**.

A aplicação permite administrar usuários, clientes, veículos, peças, estoque, orçamentos e ordens de serviço, com controle de acesso baseado em diferentes níveis de permissão.

## 🛠️ Stack

### Frontend

* **Next.js 14**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **React Query**
* **Axios**

### Backend

* **Node.js**
* **NestJS**
* **TypeScript**
* **Prisma ORM**
* **PostgreSQL**
* **JWT**
* **Swagger**

### Infraestrutura

* **Docker**
* **Docker Compose**

## ✨ Funcionalidades

* 🔐 Autenticação com JWT e Refresh Token
* 👥 Controle de acesso baseado em funções
* 👤 Gerenciamento de usuários
* 👨‍🔧 Gerenciamento de clientes e mecânicos
* 🚘 Cadastro e gerenciamento de veículos
* 📦 Controle de estoque de peças
* 📋 Ordens de serviço
* 💰 Orçamentos
* 📊 Controle operacional
* 📝 Auditoria de movimentações de estoque
* 🔒 Controle de concorrência no estoque
* 🔢 Numeração automática de ordens de serviço e orçamentos
* 📱 Interface responsiva

## 🔐 Perfis de acesso

O sistema possui quatro níveis de acesso:

| Perfil         | Descrição                                           |
| -------------- | --------------------------------------------------- |
| `ADMIN`        | Gerenciamento completo do sistema                   |
| `MANAGER`      | Acesso às principais operações administrativas      |
| `RECEPTIONIST` | Atendimento, clientes, veículos e ordens de serviço |
| `MECHANIC`     | Acesso às ordens de serviço atribuídas ao mecânico  |

Novos usuários são cadastrados inicialmente como `RECEPTIONIST`. A criação de usuários com permissões elevadas é restrita a administradores.

## 🔒 Segurança

A aplicação possui mecanismos para proteger operações críticas:

* Autenticação baseada em **JWT**
* Refresh Token com rotação
* Controle de autorização por função
* Auditoria de movimentações de estoque vinculada ao usuário autenticado
* Lock otimista para evitar alterações simultâneas no estoque
* Controle transacional para geração de identificadores
* Restrição de acesso às ordens de serviço conforme o perfil do usuário

## 📁 Estrutura do projeto

```text
autocare/
├── backend/
│   ├── src/
│   ├── prisma/
│   └── ...
│
├── frontend/
│   ├── src/
│   └── ...
│
├── docker-compose.yml
└── README.md
```

## 🚀 Como executar

### Pré-requisitos

Antes de iniciar, certifique-se de possuir:

* Node.js
* npm
* Docker
* Docker Compose

### 1. Banco de dados

Na raiz do projeto, execute:

```bash
docker compose up -d
```

Isso iniciará o PostgreSQL na porta `5432`.

Configuração padrão:

```text
Host: localhost
Port: 5432
Database: autocare
User: postgres
Password: postgres
```

### 2. Backend

Entre no diretório do backend:

```bash
cd backend
```

Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Instale as dependências:

```bash
npm install
```

Execute as migrations:

```bash
npx prisma migrate dev --name init
```

Execute o seed:

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

A documentação da API pode ser acessada pelo Swagger em:

```text
http://localhost:8080/api/swagger-ui
```

### 3. Frontend

Em outro terminal:

```bash
cd frontend
```

Configure as variáveis de ambiente:

```bash
cp .env.example .env.local
```

Instale as dependências:

```bash
npm install
```

Inicie a aplicação:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## 👤 Usuário de demonstração

O seed inicial cria um usuário administrador:

```text
E-mail: admin@autocare.com
Senha: admin123
```

> ⚠️ Altere as credenciais padrão em ambientes de produção.

## 📚 API

A API possui documentação interativa através do **Swagger**, permitindo consultar endpoints, parâmetros, respostas e testar as operações diretamente pela interface.

```text
http://localhost:8080/api/swagger-ui
```

## 🧠 Destaques técnicos

### Controle de concorrência

O gerenciamento de estoque utiliza **lock otimista**, evitando que alterações simultâneas sobrescrevam dados incorretamente.

### Operações transacionais

Operações críticas utilizam transações para garantir consistência dos dados, incluindo a geração sequencial de ordens de serviço e orçamentos.

### Autorização por função

As permissões são aplicadas de acordo com o perfil autenticado, garantindo que cada usuário tenha acesso somente às operações permitidas para sua função.

## 📌 Status

🚧 Projeto em desenvolvimento.

O sistema está estruturado para evolução contínua, permitindo a inclusão de novos módulos, funcionalidades e integrações.

## 📄 Licença

Este projeto está disponível sob a licença definida no repositório.
