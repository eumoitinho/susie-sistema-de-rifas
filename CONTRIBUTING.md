# Guia de Contribuição para Susie

Obrigado por considerar contribuir com o projeto Susie! Este documento fornece diretrizes para contribuir.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Convenções de Código](#convenções-de-código)
- [Pull Requests](#pull-requests)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Melhorias](#sugerindo-melhorias)

## 📜 Código de Conduta

Este projeto adere a um Código de Conduta. Ao participar, você concorda em manter este código. As contribuições devem ser:

- Respeitosas e inclusivas
- Construtivas e educadas
- Focadas na qualidade do código
- Documentadas adequadamente

## 🤝 Como Posso Contribuir?

### Reportando Bugs

Se você encontrou um bug, por favor:

1. **Verifique** se o bug já não foi reportado nas Issues
2. **Abra uma nova Issue** com:
   - Título descritivo
   - Descrição clara do bug
   - Passos para reproduzir
   - Comportamento esperado vs. atual
   - Ambiente (OS, versão do Node, browser)
   - Screenshots se aplicável

### Sugerindo Melhorias

1. **Verifique** se a melhoria já não foi sugerida
2. **Abra uma Issue** com:
   - Tipo: "Feature Request"
   - Descrição clara da funcionalidade
   - Casos de uso
   - Exemplos de interface se aplicável

### Contribuindo com Código

1. **Fork** o repositório
2. **Clone** seu fork
3. **Crie uma branch** para sua feature/bug fix
4. **Desenvolva** sua solução
5. **Teste** suas mudanças
6. **Documente** o que foi alterado
7. **Abra um Pull Request**

## 🔄 Processo de Desenvolvimento

### 1. Setup Local

```bash
# Clone seu fork
git clone https://github.com/seu-usuario/susie.git
cd susie

# Instale dependências
npm install
cd backend && npm install
cd ../frontend && npm install

# Configure variáveis de ambiente (veja README.md)
```

### 2. Criando uma Branch

Use nomes descritivos seguindo o padrão:

- `feature/` - Nova funcionalidade
- `fix/` - Correção de bug
- `docs/` - Documentação
- `refactor/` - Refatoração
- `test/` - Testes
- `chore/` - Tarefas de manutenção

Exemplos:
```bash
git checkout -b feature/pix-payment
git checkout -b fix/login-validation
git checkout -b docs/api-examples
```

### 3. Fazendo Commits

Siga as convenções de commit:

```
tipo(escopo): descrição curta

Descrição mais detalhada se necessário

Corpo do commit com:
- O que foi alterado
- Por que foi alterado
- Referências a issues (se houver)
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `test`: Adição/modificação de testes
- `chore`: Tarefas de build/config

**Exemplos:**
```bash
git commit -m "feat(payment): adiciona integração PIX com AbacatePay"
git commit -m "fix(auth): corrige validação de senha no login"
git commit -m "docs(api): atualiza documentação do endpoint de rifas"
```

### 4. Testando

Antes de enviar um PR, certifique-se de:

- [ ] Código compila sem erros
- [ ] Backend funciona corretamente
- [ ] Frontend renderiza sem erros
- [ ] Funcionalidade implementada funciona
- [ ] Não introduziu regressões
- [ ] Código segue os padrões estabelecidos

### 5. Atualize a Documentação

Se sua contribuição adiciona ou modifica funcionalidades:

- [ ] Atualize o README.md se necessário
- [ ] Adicione/atualize exemplos na documentação da API
- [ ] Documente novas variáveis de ambiente
- [ ] Atualize o CHANGELOG.md

## 💻 Convenções de Código

### JavaScript/TypeScript

- Use **async/await** em vez de callbacks
- Use **const** por padrão, **let** quando necessário
- Evite **var**
- Sempre trate erros com try/catch
- Use nomes descritivos para variáveis e funções

### Estrutura de Arquivos

```javascript
// 1. Imports
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

// 2. Definições
const router = express.Router();

// 3. Funções auxiliares
function helperFunction() {
  // ...
}

// 4. Rotas
router.get('/endpoint', async (req, res) => {
  try {
    // Lógica aqui
  } catch (error) {
    console.error('Error description:', error);
    res.status(500).json({ error: 'Error message' });
  }
});

// 5. Export
export default router;
```

### Nomenclatura

- **Variáveis**: camelCase (`nomeUsuario`, `validaCpf`)
- **Constantes**: UPPER_SNAKE_CASE (`JWT_SECRET`, `MAX_UPLOAD_SIZE`)
- **Funções**: camelCase (`criarRifa()`, `processarPagamento()`)
- **Componentes React**: PascalCase (`MinhaRifa`, `BilheteCard`)
- **Arquivos**: lowercase com hífens se múltiplas palavras (`auth.js`, `rifa-card.tsx`)

### Comentários

- Comente lógica complexa
- Use comentários descritivos
- Evite comentários óbvios
- Use português nos comentários

```javascript
// BOM
// Calcula o total da rifa multiplicando valor por quantidade de bilhetes vendidos
const total = bilhetesVendidos.length * rifa.valor_bilhete;

// RUIM
// Multiplica bilhetes por valor
const total = bilhetesVendidos.length * rifa.valor_bilhete;
```

### Tratamento de Erros

```javascript
// Sempre use try/catch em funções async
router.post('/endpoint', async (req, res) => {
  try {
    // Validação
    if (!req.body.campo) {
      return res.status(400).json({ error: 'Campo é obrigatório' });
    }
    
    // Lógica
    const resultado = await algumaOperacao();
    
    // Sucesso
    res.json(resultado);
  } catch (error) {
    console.error('Contexto do erro:', error);
    res.status(500).json({ error: 'Mensagem amigável ao usuário' });
  }
});
```

### SQL

- Use prepared statements (nunca concatene strings)
- Valide dados antes de inserir no banco
- Use transactions quando apropriado

```javascript
// BOM
await run('SELECT * FROM rifas WHERE id = ?', [rifaId]);

// RUIM
await run(`SELECT * FROM rifas WHERE id = ${rifaId}`);
```

## 🔀 Pull Requests

### Checklist do PR

Antes de abrir um PR, certifique-se:

- [ ] Código segue as convenções estabelecidas
- [ ] Commits seguem o padrão de mensagens
- [ ] Documentação foi atualizada
- [ ] Testes foram feitos manualmente
- [ ] Não há erros de linting
- [ ] Branch está atualizada com main
- [ ] Imagens/arquivos grandes não foram commitados

### Template de PR

```markdown
## Descrição
Breve descrição do que foi implementado/corrigido.

## Tipo de mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Melhoria de performance
- [ ] Melhoria de documentação

## Como testar
Passos para testar a mudança:
1. 
2. 
3. 

## Screenshots (se aplicável)
[Adicione screenshots aqui]

## Checklist
- [ ] Código segue as convenções
- [ ] Documentação atualizada
- [ ] Testes realizados
- [ ] Sem warnings/erros
```

### Processo de Review

1. **Mantenedor revisa** o código
2. **Sugestões são feitas** via comentários
3. **Contribuidor atualiza** o código se necessário
4. **PR é aprovado** e mergeado

### Após o Merge

Seu PR será mergeado seguindo o princípio:
- Small, focused changes são mergeados mais rápido
- PRs grandes podem levar mais tempo para review
- Mantemos a história do git limpa

## 🐛 Reportando Bugs

Use este template:

```markdown
**Descrição do Bug**
Descrição clara e concisa do bug.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '....'
3. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Comportamento Atual**
O que realmente acontece.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente:**
- OS: [e.g. Ubuntu 22.04]
- Node: [e.g. 18.17.0]
- Browser: [e.g. Chrome 120]
- Versão: [e.g. 1.0.0]

**Informações Adicionais**
Qualquer outra informação relevante.
```

## 💡 Sugerindo Melhorias

Use este template:

```markdown
**Problema/Necessidade**
Descrição do problema que será resolvido ou necessidade atendida.

**Solução Proposta**
Descrição clara da solução que você sugere.

**Alternativas Consideradas**
Outras soluções que você considerou.

**Contexto Adicional**
Qualquer outro contexto sobre a feature request.
```

## 📚 Recursos Úteis

- [Guia de Convenções de Commit](https://www.conventionalcommits.org/)
- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Express](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

## ❓ Dúvidas?

Se você tem dúvidas sobre como contribuir:

1. Abra uma Issue com a tag "question"
2. Verifique Issues existentes
3. Entre em contato com os mantenedores

## 🙏 Agradecimentos

Obrigado por contribuir com o Susie! Cada contribuição, grande ou pequena, é valiosa.

---

**Vamos tornar o Susie ainda melhor juntos! 🚀**

