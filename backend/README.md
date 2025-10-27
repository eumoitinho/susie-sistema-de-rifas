# Backend - Susie

Servidor Express.js para o sistema de rifas.

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend` com as seguintes variáveis:

```env
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Server Configuration
PORT=3005
NODE_ENV=development

# AbacatePay Configuration
ABACATEPAY_API_KEY=your_abacatepay_api_key_here
ABACATEPAY_BASE_URL=https://api.abacatepay.com/v1
ABACATEPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### Gerando uma JWT_SECRET Segura

```bash
# No terminal
openssl rand -base64 32
```

## Instalação

```bash
cd backend
npm install
```

## Execução

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Ou usar o comando da raiz
npm run dev:backend
```

## Estrutura

```
backend/
├── database.js          # Configuração SQLite
├── server.js           # Servidor Express
├── middleware/
│   └── auth.js        # Middleware JWT
└── routes/
    ├── auth.js        # Autenticação
    ├── rifas.js       # Rifas
    ├── bilhetes.js    # Bilhetes
    ├── pagamento.js   # Pagamentos PIX
    └── upload.js      # Upload de arquivos
```

## Endpoints

Veja [README.md](../README.md#-documentação-da-api) para documentação completa da API.

## Banco de Dados

SQLite é usado por padrão. O arquivo `database.sqlite` será criado automaticamente na primeira execução.

