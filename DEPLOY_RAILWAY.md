# Deploy no Railway 🚂

Este guia mostra como fazer o deploy do Susie (Sistema de Rifas) no Railway com **dois serviços separados**: Backend e Frontend.

## 📋 Pré-requisitos

- Conta no [Railway](https://railway.app)
- Conta no GitHub (para conectar o repositório)
- Chave de API do AbacatePay

## 🏗️ Estrutura do Projeto

O projeto tem dois serviços que precisam ser deployados separadamente:

- **Backend**: `backend/` - API Express.js
- **Frontend**: `frontend/` - Next.js 16

## 🚀 Passo a Passo

### 1. Criar Novo Projeto no Railway

1. Acesse [Railway](https://railway.app)
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Escolha o repositório do Susie

### 2. Criar Serviço BACKEND

1. No projeto criado, clique em **"New"** → **"GitHub Repo"** (ou use o mesmo repositório)
2. **IMPORTANTE**: Configure o **Root Directory**:
   - Vá em **Settings** do serviço
   - Em **"Root Directory"**, digite: `backend`
   - Salve as alterações
3. Configure as variáveis de ambiente (veja seção abaixo)

### 3. Criar Serviço FRONTEND

1. No mesmo projeto, clique em **"New"** → **"GitHub Repo"** (ou use o mesmo repositório)
2. **IMPORTANTE**: Configure o **Root Directory**:
   - Vá em **Settings** do serviço
   - Em **"Root Directory"**, digite: `frontend`
   - Salve as alterações
3. Configure as variáveis de ambiente (veja seção abaixo)

### 4. Configurar Variáveis de Ambiente

#### BACKEND - Variables

No painel do serviço BACKEND, vá em **Variables** e adicione:

```env
# JWT Configuration
JWT_SECRET=seu_secret_key_super_seguro_aqui_min_32_chars

# AbacatePay API Configuration
ABACATEPAY_API_KEY=sua_api_key_abacatepay
ABACATEPAY_BASE_URL=https://api.abacatepay.com/v1
ABACATEPAY_WEBHOOK_SECRET=seu_webhook_secret

# Server Configuration
PORT=8080
HOST=0.0.0.0
NODE_ENV=production

# Frontend URL (para CORS)
FRONTEND_URL=https://seu-frontend.railway.app
```

#### FRONTEND - Variables

No painel do serviço FRONTEND, vá em **Variables** e adicione:

```env
# Backend API URL
BACKEND_API_URL=https://seu-backend.railway.app
BACKEND_API_PREFIX=/api

# App URL
NEXT_PUBLIC_APP_URL=https://seu-frontend.railway.app

# JWT Secret (deve ser o MESMO do backend)
JWT_SECRET=seu_secret_key_super_seguro_aqui_min_32_chars

# Environment
NODE_ENV=production
```

> **⚠️ IMPORTANTE**: O `JWT_SECRET` deve ser **idêntico** em ambos os serviços!

### 5. Configurar Root Directory (CRÍTICO)

**Este é o passo mais importante!** Se não configurar corretamente, o deploy falhará.

#### Para o Serviço BACKEND:

1. Vá em **Settings** do serviço BACKEND
2. Role até **"Root Directory"**
3. Digite exatamente: `backend` (sem barra, sem aspas)
4. Clique em **"Save"**

#### Para o Serviço FRONTEND:

1. Vá em **Settings** do serviço FRONTEND
2. Role até **"Root Directory"**
3. Digite exatamente: `frontend` (sem barra, sem aspas)
4. Clique em **"Save"**

### 6. Configurar Build e Start Commands

**Deixe vazios!** O `nixpacks.toml` já gerencia tudo.

- **Build Command**: Deixe vazio
- **Start Command**: Deixe vazio

O Railway detectará automaticamente:
- Node.js através do `package.json` e `.node-version`
- `nixpacks.toml` para as fases de build
- Scripts do `package.json` para start

### 7. Configurar Volume (Opcional para SQLite)

Para persistir o banco de dados SQLite no BACKEND:

1. No painel do serviço BACKEND, clique em **"Settings"**
2. Vá em **"Volumes"**
3. Clique em **"Add Volume"**
4. Configure:
   - **Mount Path**: `/app` (ou `/app/backend` dependendo da estrutura)
   - **Size**: 1 GB (ou conforme necessário)

> **Nota**: Para produção robusta, considere usar PostgreSQL ao invés de SQLite.

### 8. Deploy

1. Após configurar tudo, o Railway fará o deploy automaticamente
2. Aguarde o build completar (pode levar alguns minutos)
3. Após o deploy, você receberá URLs públicas para cada serviço

### 9. Testar os Serviços

#### Testar BACKEND:

```bash
curl https://seu-backend.railway.app/api/health
```

Resposta esperada:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

#### Testar FRONTEND:

Acesse a URL do frontend no navegador. Deve carregar a página inicial.

### 10. Atualizar URLs nas Variáveis de Ambiente

Após obter as URLs dos serviços:

1. Atualize `FRONTEND_URL` no BACKEND com a URL do frontend
2. Atualize `BACKEND_API_URL` no FRONTEND com a URL do backend
3. Atualize `NEXT_PUBLIC_APP_URL` no FRONTEND com a URL do frontend
4. Faça um redeploy de ambos os serviços

## 🔧 Configurações Avançadas

### Custom Domain

Para cada serviço:

1. No painel do serviço, vá em **"Settings"**
2. Clique em **"Domains"**
3. Adicione seu domínio customizado
4. Configure os registros DNS conforme instruído

### Webhook do AbacatePay

Configure o webhook no painel do AbacatePay para:

```
https://seu-backend.railway.app/api/pagamento/webhook
```

### Logs e Monitoramento

Para visualizar logs em tempo real:

1. No painel do serviço, vá em **"Deployments"**
2. Clique no deployment ativo
3. Acesse a aba **"Logs"**

## 🐛 Troubleshooting

### Erro: "Nixpacks was unable to generate a build plan"

**Causa**: Root Directory não configurado ou incorreto.

**Solução**:
1. Verifique se o Root Directory está configurado corretamente
2. Deve ser exatamente `backend` ou `frontend` (sem barra, sem aspas)
3. Certifique-se de que os arquivos `package.json` e `nixpacks.toml` existem no diretório correto

### Erro: "npm: command not found"

**Causa**: Root Directory não configurado, Railway está olhando na raiz.

**Solução**: Configure o Root Directory corretamente (veja passo 5).

### Erro: "Cannot find module '/app/backend/server.js'"

**Causa**: Root Directory configurado, mas comandos ainda tentam acessar `/app/backend/`.

**Solução**: 
- Remova qualquer `cd backend` dos comandos
- Deixe Build/Start Command vazios
- O `nixpacks.toml` já gerencia tudo

### Erro: "Application failed to respond"

**Solução**:
- Verifique se a variável `PORT` está configurada
- Certifique-se de que o servidor está escutando em `0.0.0.0`
- Verifique os logs do serviço

### Erro: "JsonWebTokenError: invalid signature"

**Causa**: `JWT_SECRET` diferente entre backend e frontend.

**Solução**: 
- Use o **mesmo** `JWT_SECRET` em ambos os serviços
- Faça redeploy de ambos após atualizar

### Banco de dados não persiste

**Solução**:
- Configure um volume para o diretório do banco
- Ou migre para PostgreSQL usando Railway Postgres

### Erro de CORS

**Solução**:
- Configure `FRONTEND_URL` no BACKEND com a URL correta do frontend
- Verifique as configurações de CORS no `server.js`

### Upload de arquivos não funciona

**Solução**:
- Verifique se os diretórios `uploads/` e `comprovantes/` são criados automaticamente
- Configure um volume se necessário

## 🔄 Atualizações Automáticas

O Railway fará deploy automaticamente quando você:

1. Fizer push para a branch configurada (geralmente `main`)
2. O build será executado automaticamente
3. Se o build passar, o novo código será deployed

## 📊 Migração para PostgreSQL (Recomendado)

Para usar PostgreSQL no Railway:

1. No projeto, clique em **"New"** → **"Database"** → **"PostgreSQL"**
2. O Railway criará automaticamente a variável `DATABASE_URL`
3. Atualize o código do backend para usar PostgreSQL ao invés de SQLite
4. Instale o driver: `npm install pg`

## 💰 Custos

Railway oferece:

- ✅ $5 de crédito gratuito por mês
- ✅ 500 horas de execução gratuitas
- ✅ Preço baseado em uso após isso

**Nota**: Dois serviços = dobro do uso de recursos.

## 📚 Recursos Úteis

- [Documentação do Railway](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app)
- [Nixpacks Documentation](https://nixpacks.com)

## ✅ Checklist de Deploy

Antes de considerar o deploy completo, verifique:

- [ ] Root Directory configurado para BACKEND (`backend`)
- [ ] Root Directory configurado para FRONTEND (`frontend`)
- [ ] Build Command vazio em ambos os serviços
- [ ] Start Command vazio em ambos os serviços
- [ ] `JWT_SECRET` idêntico em ambos os serviços
- [ ] `BACKEND_API_URL` configurado no FRONTEND
- [ ] `FRONTEND_URL` configurado no BACKEND
- [ ] URLs atualizadas após primeiro deploy
- [ ] Health check do backend funcionando
- [ ] Frontend carregando corretamente
- [ ] Teste de login funcionando
- [ ] Webhook do AbacatePay configurado

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs no painel do Railway
2. Confirme que o Root Directory está configurado corretamente
3. Consulte a documentação oficial
4. Abra uma issue no repositório do projeto
