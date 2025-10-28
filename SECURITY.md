# Política de Segurança

## Versões Suportadas

Usamos versões do projeto para indicar quais versões estão atualmente sendo suportadas com atualizações de segurança.

| Versão | Suportada          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reportando Vulnerabilidades

A segurança do projeto **Susie** é importante para nós e para a comunidade. Se você descobrir uma vulnerabilidade de segurança, pedimos que nos informe de forma responsável.

### Como Reportar

**Por favor, NÃO** use o rastreador de issues do GitHub para relatar vulnerabilidades de segurança.

Em vez disso, envie um e-mail para: **security@seu-dominio.com**

Por favor, inclua as seguintes informações:

- Tipo de vulnerabilidade
- Passos para reproduzir
- Impacto potencial
- Sugestões de correção (se houver)
- Qualquer código de exemplo relevante

### Processo

1. Entraremos em contato em até **48 horas** confirmando o recebimento
2. Vamos investigar e validar a vulnerabilidade
3. Manteremos você informado sobre o progresso
4. Desenvolveremos uma correção
5. Lançaremos a correção em uma versão de segurança
6. Reconheceremos sua contribuição (a menos que você prefira anonimato)

### Timeline Esperado

- **48 horas**: Confirmação inicial
- **7 dias**: Atualização sobre o progresso
- **30 dias**: Correção (ou comunicação de status)

Exceções podem ser feitas para vulnerabilidades críticas que estejam sendo exploradas ativamente.

## Disclosura Responsável

Pedimos que:

- Não compartilhe a vulnerabilidade publicamente até que uma correção esteja disponível
- Dê-nos tempo razoável para corrigir a vulnerabilidade antes de divulgar
- Seja respeitoso e profissional em todas as comunicações

## Reconhecimentos

Agradecemos a todos que reportam vulnerabilidades de forma responsável. Listaremos os pesquisadores de segurança que contribuírem com correções no nosso arquivo de reconhecimentos.

## Boas Práticas de Segurança

### Para Usuários

1. **Mantenha atualizado**: Use sempre a versão mais recente do projeto
2. **Variáveis de ambiente**: Nunca exponha ou compartilhe suas credenciais
3. **JWT Secret**: Use um secret forte e único (min. 32 caracteres)
4. **HTTPS**: Use sempre HTTPS em produção
5. **Backups**: Mantenha backups regulares do banco de dados
6. **Monitoramento**: Monitore logs para atividades suspeitas

### Para Desenvolvedores

1. **Dependências**: Mantenha dependências atualizadas
2. **Input Validation**: Valide TODOS os inputs do usuário
3. **SQL Injection**: Use SEMPRE prepared statements
4. **Secrets**: Nunca commite secrets no código
5. **Princípio do Menor Privilégio**: Dê apenas permissões necessárias
6. **Logs**: Não registre informações sensíveis

## Vulnerabilidades Conhecidas

Nenhuma vulnerabilidade conhecida no momento.

## Histórico de Segurança

Nenhum incidente reportado até o momento.

## Contato

Para questões de segurança: **security@seu-dominio.com**

## Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Última atualização**: 2024-01-15


