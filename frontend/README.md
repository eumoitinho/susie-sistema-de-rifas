## Susie | Frontend (Next.js 16)

Interface completa do Susie Rifas em Next.js 16 (App Router) com React 19 e Tailwind CSS 4. Inclui:

- **Vitrine pública** (`/`, `/rifas/:id`) com compra via PIX (AbacatePay)
- **Painel administrativo** protegido (`/dashboard/*`)
- **Fluxo de autenticação** via BetterAuth com cookies httpOnly
- **Emissão e consulta de bilhetes** (`/bilhetes/:codigo`)

### Pré-requisitos

- Node.js 20+
- Backend Express (pasta `backend/`) executando – por padrão em `http://localhost:3005`

### Variáveis de ambiente

Crie um arquivo `.env` na pasta `frontend` com os valores abaixo (ajuste os hosts conforme o seu ambiente):

```
BACKEND_API_URL=http://localhost:3005
BACKEND_API_PREFIX=/api
JWT_SECRET=mesmo_segredo_do_backend
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:3005
```

- `BACKEND_API_URL` → endereço base do backend.
- `BACKEND_API_PREFIX` → prefixo das rotas (mantido em `/api` por padrão).
- `JWT_SECRET` → **deve ser idêntico** ao usado pelo backend para assinar/verificar JWT.
- `NEXT_PUBLIC_APP_URL` → URL pública do frontend (usada para gerar links de compartilhamento).
- `NEXT_PUBLIC_BACKEND_URL` → URL pública do backend (para abrir comprovantes HTML).

### Instalação

```bash
cd frontend
npm install
```

### Desenvolvimento

```bash
# frontend
npm run dev

# backend (em outro terminal)
npm run dev:backend
```

O frontend ficará em `http://localhost:3000` e o backend em `http://localhost:3005`. Para testar o fluxo completo é necessário ter os dois serviços ativos.

### Scripts úteis

- `npm run dev` → modo desenvolvimento (Next + HMR)
- `npm run lint` → validação com ESLint

### Estrutura principal

- `src/app/page.tsx` → landing pública com vitrine de rifas
- `src/app/rifas/[id]` → página pública de detalhes + compra via PIX
- `src/app/bilhetes/[codigo]` → consulta do status/comprovante do bilhete
- `src/app/(auth)` → telas de login/cadastro
- `src/app/(protected)` → dashboard administrativo
- `src/app/api/**` → rotas proxy que protegem as chamadas ao backend
- `src/components/public` → componentes reutilizáveis da vitrine/fluxo de compra
- `src/lib` → clientes HTTP (backendFetch), utilitários de formatação, cliente BetterAuth
- `src/types` → tipagens compartilhadas (`Rifa`, `Bilhete`, `PublicRifaSummary`)

### Fluxo de autenticação (BetterAuth)

O cliente (`better-auth/react`) consome as rotas `POST /api/auth/sign-in/email`, `POST /api/auth/sign-up/email`, `POST /api/auth/sign-out` e `GET /api/auth/get-session`. Essas rotas fazem proxy para o backend (`/auth/login` e `/auth/register`), salvam o JWT em cookie httpOnly e retornam a sessão para o frontend.

### Rotas internas relevantes

#### Público
- `GET /api/rifas/public/list` → lista rifas disponíveis (proxy para `GET /rifas/public/list`)
- `GET /api/rifas/:id` → detalhes públicos da rifa (com números disponíveis)
- `POST /api/pagamento/pix` → inicia pagamento PIX via AbacatePay
- `GET /api/pagamento/bilhete/:codigo` → consulta status do bilhete
- `GET /api/pagamento/status/:pixId` → consulta status do QR Code (opcional)

#### Administrativo (requer sessão)
- `GET /api/rifas` / `POST /api/rifas` / `PUT /api/rifas/:id` / `DELETE /api/rifas/:id`
- `GET /api/rifas/:id` (com token) → traz informações estendidas para o dashboard
- `GET /api/bilhetes/rifa/:id` → lista bilhetes de uma rifa do organizador

Todas as rotas autenticadas usam o cookie `susie.auth-token` para enviar `Authorization: Bearer ...`.

### Fluxo completo do comprador
1. Acessa `/` ou `/rifas/:id`, escolhe um número disponível e informa dados pessoais.
2. `POST /api/pagamento/pix` gera o QR Code PIX e retorna `codigo_visualizacao`.
3. Após o pagamento, o status atualiza via webhook ou consulta (`/bilhetes/:codigo`).
4. O comprovante HTML fica disponível em `${NEXT_PUBLIC_BACKEND_URL}/pagamento/comprovante/:codigo`.

### Checklist antes de subir
- [ ] Backend e frontend usando o **mesmo** `JWT_SECRET`
- [ ] Variáveis do AbacatePay (API key & webhook) configuradas no backend
- [ ] `NEXT_PUBLIC_APP_URL` e `NEXT_PUBLIC_BACKEND_URL` refletindo os domínios finais
- [ ] Cookies limpos após alterar o segredo JWT (gera novo token válido)
