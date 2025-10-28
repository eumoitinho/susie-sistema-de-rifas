# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere a [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2024-01-15

### Adicionado

#### Sistema de Autenticação
- Cadastro de usuários com email e senha
- Login com JWT e expiração de 24h
- Middleware de autenticação para rotas protegidas
- Hash de senhas com bcrypt

#### Gerenciamento de Rifas
- CRUD completo de rifas
- Criação de rifas com título, descrição, valor, data de sorteio
- Upload múltiplo de fotos (até 10 por rifa)
- Visualização pública e privada de rifas
- Listagem de rifas do usuário
- Edição e exclusão de rifas

#### Sistema de Bilhetes
- Reserva de bilhetes com validação
- Prevenção de duplicatas
- Código de visualização único por bilhete
- Listagem de bilhetes por rifa
- Status de pagamento (PENDING | PAID)

#### Integração de Pagamentos
- Integração com AbacatePay para pagamentos PIX
- Geração automática de QR Code PIX
- Sistema de webhook para confirmação de pagamentos
- Verificação de status de pagamento
- Cadastro automático de clientes na plataforma de pagamento

#### Comprovantes
- Geração automática de comprovantes HTML
- Visualização de bilhetes pelo código único
- Formatação responsiva e imprimível
- Botão de impressão/salvar como PDF

#### Upload de Arquivos
- Upload de fotos com Multer
- Validação de tipo de arquivo
- Limite de tamanho (5MB por arquivo)
- Armazenamento local em `/uploads`
- Suporte para: jpeg, jpg, png, gif, webp

#### Interface do Usuário
- Design moderno com Tailwind CSS 4
- Componentes reutilizáveis com Radix UI
- Interface responsiva para mobile e desktop
- Páginas:
  - Home
  - Login
  - Cadastro
  - Nova Rifa
  - Detalhes da Rifa
  - Visualização Pública
  - Visualização de Bilhete
  - Listagem de Rifas

#### Banco de Dados
- Esquema SQLite com 4 tabelas principais
- Relacionamentos entre tabelas
- Índices para performance
- Constraints de integridade

#### API REST
- Endpoints documentados
- Validação de dados
- Tratamento de erros
- CORS configurado
- Health check endpoint

#### Documentação
- README completo
- Documentação da API
- Guia de instalação e uso
- Exemplos de requisições
- Estrutura do projeto

### Segurança
- Senhas hasheadas com bcrypt (salt rounds: 10)
- Tokens JWT com expiração
- Validação de entrada em todas as rotas
- Prepared statements SQL
- Sanitização de dados de usuário
- Proteção contra SQL injection
- Validação de tipos de arquivo

### Performance
- Conexão persistente com SQLite
- Queries otimizadas
- Índices em campos-chave
- Imagens servidas estaticamente
- Código modular e reutilizável

### Compatibilidade
- Node.js >= 18
- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- SQLite 3
- Express.js 4.18+
- Next.js 16
- React 19

---

## Tipos de Mudanças

- `Adicionado` - Novas funcionalidades
- `Modificado` - Mudanças em funcionalidades existentes
- `Depreciado` - Funcionalidades que serão removidas
- `Removido` - Funcionalidades removidas
- `Corrigido` - Correção de bugs
- `Segurança` - Vulnerabilidades corrigidas

---

## Links

- [GitHub](https://github.com/seu-usuario/susie)
- [Documentação](https://github.com/seu-usuario/susie/blob/main/README.md)
- [Issues](https://github.com/seu-usuario/susie/issues)

---

**Nota**: Este é o release inicial do projeto. Todas as funcionalidades listadas foram implementadas na versão 1.0.0.


