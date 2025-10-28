# Susie - Sistema de Rifas Online 🎲

> Sistema completo e open-source para gerenciamento de rifas online com integração de pagamentos via PIX.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)
![Next.js](https://img.shields.io/badge/next.js-16-black)

## 📋 Índice

- [Sobre](#-sobre)
- [Características](#-características)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [API Documentation](#-documentação-da-api)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Configuração](#-configuração)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)
- [Changelog](#-changelog)

## 🎯 Sobre

O **Susie** é uma plataforma completa e open-source para gerenciamento de rifas online. Desenvolvido com tecnologias modernas, permite criar rifas, gerenciar bilhetes, processar pagamentos via PIX e gerar comprovantes automaticamente.

### Principais Funcionalidades

- 🔐 **Autenticação Segura**: Sistema de login e cadastro com JWT
- 🎫 **Gerenciamento de Rifas**: CRUD completo de rifas com fotos
- 💳 **Pagamentos PIX**: Integração com AbacatePay para processamento de pagamentos
- 📄 **Comprovantes Automáticos**: Geração de PDFs/HTML para comprovantes de compra
- 📱 **Interface Moderna**: UI responsiva com Next.js e Tailwind CSS
- 🔒 **Validação de Números**: Sistema automático para evitar duplicatas

## ✨ Características

- ✅ Cadastro e login com JWT
- ✅ CRUD completo de rifas
- ✅ Upload múltiplo de fotos
- ✅ Reserva de bilhetes com validação
- ✅ Pagamentos via PIX com integração AbacatePay
- ✅ Webhook para confirmação automática de pagamentos
- ✅ Geração automática de comprovantes HTML
- ✅ Código de visualização único para cada bilhete
- ✅ Interface responsiva e moderna
- ✅ Banco de dados SQLite local
- ✅ API REST completa

## 🛠 Tecnologias

### Backend
- **Express.js** - Framework web Node.js
- **SQLite3** - Banco de dados
- **JWT** (jsonwebtoken) - Autenticação
- **bcrypt** - Hash de senhas
- **Multer** - Upload de arquivos
- **CORS** - Controle de acesso
- **UUID** - Geração de identificadores únicos

### Frontend
- **Next.js 16** - Framework React
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones

## 🚀 Instalação

### Pré-requisitos

- Node.js >= 18
- npm ou bun

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/susie.git
cd susie
```

2. **Instale as dependências**
```bash
# Na raiz
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na pasta `backend`:
```env
JWT_SECRET=seu_secret_key_seguro_aqui
ABACATEPAY_API_KEY=sua_chave_api_abacatepay
ABACATEPAY_BASE_URL=https://api.abacatepay.com/v1
ABACATEPAY_WEBHOOK_SECRET=seu_webhook_secret
PORT=3005
```

4. **Inicialize o banco de dados**

O SQLite será criado automaticamente na primeira execução.

## 💻 Uso

### Desenvolvimento

Para rodar o projeto completo (backend + frontend):

```bash
npm run dev
```

Isso iniciará:
- Backend: http://localhost:3005
- Frontend: http://localhost:3006

### Separadamente

```bash
# Backend apenas
npm run dev:backend

# Frontend apenas
npm run dev:frontend
```

### Produção

```bash
# Build do frontend
npm run build

# Iniciar servidor
npm start
```

### Uso Rápido

1. **Cadastre-se**: Acesse http://localhost:3006/register
2. **Faça login**: Use suas credenciais em http://localhost:3006/login
3. **Crie uma rifa**: Clique em "Nova Rifa" e preencha os dados
4. **Upload de fotos**: Adicione até 10 fotos para sua rifa
5. **Compartilhe**: Compartilhe o link público da rifa
6. **Reserve bilhetes**: Os compradores podem reservar e pagar via PIX
7. **Acompanhe**: Monitore vendas e status de pagamento

## 📚 Documentação da API

### Base URL
```
http://localhost:3005/api
```

### Autenticação

Todas as rotas protegidas requerem o token JWT no header:
```
Authorization: Bearer <token>
```

### Endpoints

#### 🔐 Autenticação

##### POST `/api/auth/register`
Registra um novo usuário.

**Body:**
```json
{
  "email": "usuario@email.com",
  "senha": "senha123"
}
```

**Response:**
```json
{
  "message": "Usuário cadastrado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@email.com"
  }
}
```

##### POST `/api/auth/login`
Realiza login e retorna JWT.

**Body:**
```json
{
  "email": "usuario@email.com",
  "senha": "senha123"
}
```

**Response:**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6Ik-bodied an store...",
  "user": {
    "id": 1,
    "email": "usuario@email.com"
  }
}
```

#### 🎫 Rifas

##### GET `/api/rifas`
Lista todas as rifas do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "titulo": "Rifa iPhone 15",
    "descricao": "Ganhe um iPhone 15 Pro Max",
    "foto_url": "/uploads/foto.jpg",
    "valor_bilhete": 10.00,
    "data_sorteio": "2024-12-31T23:59:59.000Z",
    "numero_max": 100,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

##### GET `/api/rifas/:id`
Busca uma rifa específica (pública ou própria).

**Response:**
```json
{
  "id": 1,
  "titulo": "Rifa iPhone 15",
  "descricao": "Ganhe um iPhone 15 ranging Max",
  "valor_bilhete": 10.00,
  "data_sorteio": "2024-12-31T23:59:59.000Z",
  "numero_max": 100,
  "numeros_ocupados": [1, 5, 10],
  "numeros_disponiveis": [2, 3, 4, 6, 7, 8, 9, 11, ...],
  "fotos": ["/uploads/foto1.jpg", "/uploads/foto2.jpg"]
}
```

##### POST `/api/rifas`
Cria uma nova rifa.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "titulo": "Rifa iPhone 15",
  "descricao": "Ganhe um iPhone 15 Pro Max",
  "valor_bilhete": 10.00,
  "data_sorteio": "2024-12-31T23:59:59.000Z",
  "numero_max": 100
}
```

**Response:**
```json
{
  "message": "Rifa criada com sucesso",
  "rifa": {
    "id": 1,
    "user_id": 1,
    "titulo": "Rifa iPhone 15",
    ...
  }
}
```

##### PUT `/api/rifas/:id`
Atualiza uma rifa existente.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "titulo": "Rifa iPhone 15 Pro",
  "valor_bilhete": 15.00
}
```

##### DELETE `/api/rifas/:id`
Deleta uma rifa e seus bilhetes.

**Headers:** `Authorization: Bearer <token>`

#### 🎟️ Bilhetes

##### GET `/api/bilhetes/rifa/:rifaId`
Lista bilhetes de uma rifa (apenas dono).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 1,
    "rifa_id": 1,
    "numero": 5,
    "nome_comprador": "João Silva",
    "cpf": "123.456.789-00",
    "whatsapp": "11999999999",
    "status_pagamento": "PAID",
    "valor_pago": 10.00,
    "data_reserva": "2024-01-15T10:30:00.000Z"
  }
]
```

#### 💳 Pagamentos

##### POST `/api/pagamento/pix`
Inicia um pagamento PIX.

**Body:**
```json
{
  "rifa_id": 1,
  "numero": 10,
  "nome_comprador": "João Silva",
  "cpf": "12345678900",
  "whatsapp": "11999999999",
  "quantidade": 1
}
```

**Response:**
```json
{
  "codigo_visualizacao": "ABC123",
  "qrcode": "data:image/png;base64,iVBORw0KG...",
  "qrcode_text": "00020126580014br.gov.bcb...",
  "amount": 10.00,
  "expira_em": "2024-01-15T10:50:00.000Z"
}
```

##### POST `/api/pagamento/webhook`
Webhook para confirmação de pagamentos (AbacatePay).

**Headers:** `X-Abacate-Signature: <secret>`

**Body:**
```json
{
  "billingId": "pix_123456",
  "status": "PAID"
}
```

##### GET `/api/pagamento/verificar-status/:pixId`
Verifica o status de um pagamento PIX.

**Response:**
```json
{
  "status": "PAID",
  "expiresAt": "2024-01-15T10:50:00.000Z"
}
```

##### GET `/api/pagamento/bilhete/:codigo`
Visualiza um bilhete pelo código de visualização.

**Response:**
```json
{
  "bilhete": {
    "numero": 10,
    "nome_comprador": "João Silva",
    "whatsapp": "11999999999",
    "status_pagamento": "PAID",
    "data_reserva": "2024-01-15T10:30:00.000Z"
  },
  "rifa": {
    "titulo": "Rifa iPhone 15",
    "descricao": "Ganhe um iPhone...",
    "data_sorteio": "2024-12-31T23:59:59.000Z"
  }
}
```

##### GET `/api/pagamento/comprovante/:codigo`
Retorna o HTML do comprovante de compra.

#### 📤 Upload

##### POST `/api/upload/rifa/:rifaId`
Upload de fotos para uma rifa (até 10 fotos).

**Headers:** `Authorization: Bearer <token>`

**Body:** `multipart/form-data`
- Campo: `fotos` (Array de arquivos)

**Limites:**
- Máximo: 10 fotos por requisição
- Tamanho máximo: 5MB por arquivo
- Formatos aceitos: jpeg, jpg, png, gif, webp

**Response:**
```json
{
  "message": "Fotos enviadas com sucessooots",
  "fotos": [
    { "url": "/uploads/fotos-123456.jpg", "filename": "fotos-123456.jpg" }
  ]
}
```

### Health Check

##### GET `/api/health`
Verifica se o servidor está ativo.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### Códigos de Status

- `200` - Sucesso
- `201` - Criado
- `400` - Bad Request
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Não encontrado
- `500` - Erro interno

## 📁 Estrutura do Projeto

```
Susie/
├── backend/
│   ├── database.js              # Configuração SQLite
│   ├── server.js                # Servidor Express
│   ├── database.sqlite          # Banco de dados
│   ├── middleware/
│   │   └── auth.js              # Middleware JWT
│   ├── routes/
│   │   ├── auth.js              # Rotas de autenticação
│   │   ├── rifas.js             # Rotas de rifas
│   │   ├── bilhetes.js          # Rotas de bilhetes
│   │   ├── pagamento.js         # Rotas de pagamento
│   │   └── upload.js            # Rotas de upload
│   ├── uploads/                 # Arquivos enviados
│   └── comprovantes/            # PDFs gerados
├── frontend/
│   ├── app/                     # Páginas Next.js
│   │   ├── page.tsx             # Home
│   │   ├── login/               # Página de login
│   │   ├── register/            # Página de cadastro
│   │   ├── rifas/               # Páginas de rifas
│   │   │   ├── nova/            # Criar rifa
│   │   │   └── [id]/            # Detalhes da rifa
│   │   ├── r/[id]/              # Visualização pública
│   │   └── bilhete/[codigo]/    # Visualizar bilhete
│   ├── components/              # Componentes React
│   │   └── ui/                  # Componentes UI
│   └── lib/                     # Utilitários
│       ├── api.ts               # Funções de API
│       └── utils.ts             # Helpers
├── README.md                    # Este arquivo
├── CONTRIBUTING.md              # Guia de contribuição
├── LICENSE                      # Licença MIT
└── CHANGELOG.md                 # Histórico de mudanças
```

## ⚙️ Configuração

### Variáveis de Ambiente

#### Backend (.env)

```env
# JWT
JWT_SECRET=seu_secret_key_super_seguro_aqui

# AbacatePay
ABACATEPAY_API_KEY=sua_api_key
ABACATEPAY_BASE_URL=https://api.abacatepay.com/v1
ABACATEPAY_WEBHOOK_SECRET=seu_webhook_secret

# Servidor
PORT=3005
NODE_ENV=development
```

### Banco de Dados

O SQLite é inicializado automaticamente com as seguintes tabelas:

#### users
- `id` (INTEGER PRIMARY KEY)
- `email` (TEXT UNIQUE)
- `senha_hash` (TEXT)
- `created_at` (DATETIME)

#### rifas
- `id` (INTEGER PRIMARY KEY)
- `user_id` (INTEGER)
- `titulo` (TEXT)
- `descricao` (TEXT)
- `foto_url` (TEXT)
- `valor_bilhete` (REAL)
- `data_sorteio` (DATETIME)
- `numero_max` (INTEGER)
- `created_at` (DATETIME)

#### bilhetes
- `id` (INTEGER PRIMARY KEY)
- `rifa_id` (INTEGER)
- `numero` (INTEGER)
- `nome_comprador` (TEXT)
- `cpf` (TEXT)
- `whatsapp` (TEXT)
- `valor_pago` (REAL)
- `data_reserva` (DATETIME)
- `codigo_visualizacao` (TEXT UNIQUE)
- `status_pagamento` (TEXT) - PENDING | PAID
- `pix_id` (TEXT)

#### fotos
- `id` (INTEGER PRIMARY KEY)
- `rifa_id` (INTEGER)
- `url` (TEXT)
- `ordem` (INTEGER)
- `created_at` (DATETIME)

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Por favor, leia o [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre nosso código de conduta e o processo de submissão de pull requests.

### Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📜 Changelog

Veja [CHANGELOG.md](CHANGELOG.md) para histórico completo de mudanças.

---

**Desenvolvido por @eumoitinho**

Se este projeto foi útil para você, considere dar uma ⭐ no GitHub!
  