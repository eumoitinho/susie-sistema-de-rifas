# Deploy no Railway 🚂

Este guia mostra como fazer o deploy do Susie (Sistema de Rifas) no Railway.

## 📋 Pré-requisitos

- Conta no [Railway](https://railway.app)
- Conta no GitHub (para conectar o repositório)
- Chave de API do AbacatePay

## 🚀 Passo a Passo

### 1. Preparar o Repositório

Certifique-se de que seu código está no GitHub e inclui os seguintes arquivos:

- ✅ `Procfile` - Configuração de inicialização
- ✅ `railway.json` - Configuração do Railway
- ✅ `package.json` - Com scripts de build e start
- ✅ `.env.example` - Exemplo de variáveis de ambiente

### 2. Criar Novo Projeto no Railway

1. Acesse [Railway](https://railway.app)
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Escolha o repositório do Susie
5. O Railway detectará automaticamente que é um projeto Node.js

### 3. Configurar Variáveis de Ambiente

No painel do Railway, vá em **Variables** e adicione:

```env
# JWT Configuration
JWT_SECRET=seu_secret_key_super_seguro_aqui_min_32_chars

# AbacatePay API Configuration
ABACATEPAY_API_KEY=sua_api_key_abacatepay
ABACATEPAY_BASE_URL=https://api.abacatepay.com/v1
ABACATEPAY_WEBHOOK_SECRET=seu_webhook_secret

# Server Configuration
PORT=3005
NODE_ENV=production

# Frontend URL (opcional, para CORS)
FRONTEND_URL=https://seu-frontend.railway.app
```

### 4. Configurar Volume (Opcional para SQLite)

Para persistir o banco de dados SQLite:

1. No painel do projeto, clique em **"Settings"**
2. Vá em **"Volumes"**
3. Clique em **"Add Volume"**
4. Configure:
   - **Mount Path**: `/app/backend`
   - **Size**: 1 GB (ou conforme necessário)

> **Nota**: Para produção robusta, considere usar PostgreSQL ao invés de SQLite.

### 5. Deploy

1. O Railway fará o deploy automaticamente após configurar
2. Aguarde o build completar (pode levar alguns minutos)
3. Após o deploy, você receberá uma URL pública

### 6. Testar a API

Teste o endpoint de health check:

```bash
curl https://seu-projeto.railway.app/api/health
```

Resposta esperada:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## 🔧 Configurações Avançadas

### Custom Domain

1. No painel do projeto, vá em **"Settings"**
2. Clique em **"Domains"**
3. Adicione seu domínio customizado
4. Configure os registros DNS conforme instruído

### Webhook do AbacatePay

Configure o webhook no painel do AbacatePay para:

```
https://seu-projeto.railway.app/api/pagamento/webhook
```

### Logs e Monitoramento

Para visualizar logs em tempo real:

1. No painel do projeto, vá em **"Deployments"**
2. Clique no deployment ativo
3. Acesse a aba **"Logs"**

## 🐛 Troubleshooting

### Erro: "Application failed to respond"

- Verifique se a variável `PORT` está configurada
- Certifique-se de que o servidor está escutando em `0.0.0.0`

### Banco de dados não persiste

- Configure um volume para o diretório `/app/backend`
- Ou migre para PostgreSQL usando Railway Postgres

### Erro de CORS

- Configure a variável `FRONTEND_URL` com a URL do seu frontend
- Verifique as configurações de CORS no `server.js`

### Upload de arquivos não funciona

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
3. Atualize o código para usar PostgreSQL ao invés de SQLite
4. Instale o driver: `npm install pg`

## 💰 Custos

Railway oferece:

- ✅ $5 de crédito gratuito por mês
- ✅ 500 horas de execução gratuitas
- ✅ Preço baseado em uso após isso

## 📚 Recursos Úteis

- [Documentação do Railway](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app)

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs no painel do Railway
2. Consulte a documentação oficial
3. Abra uma issue no repositório do projeto
