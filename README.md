# Sistema de Rifas Online

Sistema completo para gerenciamento de rifas online com backend Express e frontend Next.js.

## Tecnologias

### Backend
- **Express.js** - Framework web
- **SQLite3** - Banco de dados local
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Puppeteer** - Geração de PDFs

### Frontend
- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **App Router** - Roteamento moderno

## Estrutura do Projeto

```
Susie/
├── backend/
│   ├── database.js          # Configuração do banco de dados
│   ├── server.js            # Servidor Express
│   ├── middleware/
│   │   └── auth.js          # Middleware de autenticação JWT
│   └── routes/
│       ├── auth.js          # Rotas de autenticação (register, login)
│       ├── rifas.js         # Rotas de rifas (CRUD)
│       └── bilhetes.js      # Rotas de bilhetes (reserva com PDF)
├── frontend/
│   ├── app/                 # Páginas Next.js
│   │   ├── page.tsx         # Home
│   │   ├── login/
│   │   ├── register/
│   │   └── rifas/
│   └── lib/
│       └── api.ts           # Funções de API
└── README.md
```

## Banco de Dados

### Tabela: users
- id (INTEGER PRIMARY KEY)
- email (TEXT UNIQUE)
- senha_hash (TEXT)
- created_at (DATETIME)

### Tabela: rifas
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- titulo (TEXT)
- descricao (TEXT)
- foto_url (TEXT)
- data_sorteio (DATETIME)
- numero_max (INTEGER)
- created_at (DATETIME)

### Tabela: bilhetes
- id (INTEGER PRIMARY KEY)
- rifa_id (INTEGER)
- numero (INTEGER)
- nome_comprador (TEXT)
- cpf (TEXT)
- data_reserva (DATETIME)

## Instalação

### 1. Instalar dependências raiz
```bash
npm install
```

### 2. Instalar dependências do backend
```bash
cd backend
npm install
```

### 3. Instalar dependências do frontend
```bash
cd frontend
npm install
```

## Execução

### Desenvolvimento
Na raiz do projeto:
```bash
npm run dev
```

Isso inicia ambos:
- Backend na porta 3001 (http://localhost:3001)
- Frontend na porta 3000 (http://localhost:3000)

### Separadamente
```bash
# Backend
npm run dev:backend

# Frontend
npm run dev:frontend
```

## Rotas da API

### Autenticação
- `POST /api/auth/register` - Cadastro
- `POST /api/auth/login` - Login (retorna JWT)

### Rifas (requer autenticação)
- `GET /api/rifas` - Lista rifas do usuário
- `GET /api/rifas/:id` - Busca rifa específica
- `POST /api/rifas` - Cria nova rifa
- `PUT /api/rifas/:id` - Atualiza rifa
- `DELETE /api/rifas/:id` - Deleta rifa

### Bilhetes (requer autenticação)
- `POST /api/bilhetes/reservar` - Reserva bilhete e gera PDF

## Funcionalidades

- ✅ Cadastro e login com JWT
- ✅ CRUD completo de rifas
- ✅ Reserva de bilhetes
- ✅ Geração automática de PDF para comprovantes
- ✅ Interface moderna com Tailwind CSS
- ✅ Validação de disponibilidade de números
- ✅ Banco de dados SQLite local

## Observações

- O PDF é gerado automaticamente ao reservar um bilhete usando Puppeteer
- Os comprovantes são salvos na pasta `backend/comprovantes`
- A senha é armazenada com hash usando bcrypt
- O JWT expira em 24 horas
- Use arquivo `.env` para configurações em produção
- O banco de dados SQLite será criado automaticamente na primeira execução

## Uso Rápido

1. **Cadastre-se**: Acesse http://localhost:3000/register
2. **Faça login**: Use suas credenciais em http://localhost:3000/login
3. **Crie uma rifa**: Clique em "Nova Rifa" e preencha os dados
4. **Reserve bilhetes**: Acesse sua rifa e reserve números disponíveis
5. **Baixe o comprovante**: O PDF é gerado automaticamente após a reserva

