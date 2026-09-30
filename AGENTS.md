# LockMX: instruções para agentes

Regras comuns a todo o monorepo, lidas por Claude Code e Codex. Mantém este ficheiro curto: o detalhe vive em `docs/`.

## Projeto

Loja online da LockMX (produtos para motocross: pneus e suportes para transportar equipamento no interior de carrinhas). É um negócio real de um cliente, com dados pessoais e pagamentos, por isso segurança e correção contam mais do que rapidez.

- Um único site Next.js em `apps/web`: marketing, loja, área de cliente e painel de administração.
- Idiomas: PT-PT e EN.
- Monorepo pnpm. `packages/` só recebe código quando houver um segundo consumidor real.
- Índice da documentação e ciclo de trabalho: `docs/README.md`.

## Regra principal: nunca assumir

- Toda a decisão assenta na documentação oficial mais recente da versão instalada e no código existente do projeto.
- Antes de usar uma API do Next.js, ler a documentação incluída no pacote: `apps/web/node_modules/next/dist/docs/`. Para outras bibliotecas, consultar a documentação oficial atual (Context7 ou o site oficial).
- Se não conseguires confirmar algo, diz que não confirmaste. Não preenchas lacunas com o que te parece provável.
- Valores externos (preços, comissões, prazos legais) só entram depois de verificados na fonte oficial, com a fonte indicada.
- Se a documentação e o código divergirem, identifica a divergência e propõe a correção. Não inventes uma convenção nova.
- Decisões de tecnologia ficam em `docs/decisions/` (ADR) com as fontes consultadas.

## Como trabalhar

- Fluxo completo em `docs/workflow.md`. Resumo: ideia, decisão, spec, tasks.
- Não implementes sem spec aprovada, exceto correções pequenas e óbvias.
- Cada task tem testes (escreve o teste primeiro), e o commit da task inclui código e testes.
- Se a task estiver ambígua, pergunta antes de implementar.
- Ao concluir um módulo, cria ou atualiza o checklist em `docs/checklists/`.

## Commits

- Um commit por task, feito no fim da task, depois de lint, typecheck, testes e build relevantes passarem. Não é preciso esperar aprovação para fazer o commit.
- Formato: `<tipo>: <mensagem>`, com tipo `feat`, `arch`, `fix`, `refactor` ou `docs` (definições em `docs/workflow.md`).
- Mensagem em inglês, curta, no imperativo e em minúsculas.
- Nunca mencionar o modelo ou agente: sem `Co-Authored-By`, sem rodapés, sem "gerado por".
- Sem ícones, emojis ou símbolos gráficos nos commits.
- Não faças `push`, não abras nem funda PRs e não faças deploy sem pedido explícito.

## Código

- SOLID e Clean Code, aplicados de forma concreta: funções pequenas com um só propósito, nomes explícitos, dependências que apontam para dentro (a lógica de negócio não conhece a UI nem os fornecedores).
- Menos é mais: sem código especulativo, sem abstração antes de haver uso real, sem refatorizações fora da task.
- Nada de dependências de produção novas sem justificar a necessidade e pedir aprovação.
- Código, comentários e identificadores em inglês. Documentação em português (PT-PT). Textos visíveis ao utilizador passam sempre pelo i18n.
- Um só gestor de pacotes: pnpm, a partir da raiz. Um só lockfile.

## Segurança

- Segredos nunca em código, logs, exemplos ou commits. Variáveis `NEXT_PUBLIC_*` são públicas: nunca levam segredos.
- Validar no servidor toda a entrada não fiável. Autenticar e autorizar no servidor, em cada ação: esconder um botão não é controlo de acesso.
- Nunca confiar no browser para preços, stock, descontos, totais ou identidade do utilizador.
- Dados de cartão nunca passam pelo servidor do projeto: usa o checkout ou a tokenização do fornecedor de pagamentos.
- A confirmação de um pagamento vem do webhook do fornecedor, com assinatura verificada e processamento idempotente.
- Autenticação, pagamentos e dados pessoais seguem apenas os fluxos documentados em `docs/`. Sem atalhos.

## Comandos (a partir da raiz)

- `pnpm dev`, `pnpm build`, `pnpm lint`.
- Os comandos de testes e typecheck passam a existir com a spec de fundação técnica e são registados em `docs/workflow.md`.
- Não declares que um comando passou se não o executaste.

## Estado atual

- Decidido: Next.js, monorepo pnpm, uma só app web com o backend no próprio Next.js, Drizzle como ORM (PostgreSQL). As ADRs formalizam estas escolhas.
- Em aberto (ADR antes de escolher): autenticação (candidato: Better Auth), fornecedor de pagamentos, fornecedor de base de dados e alojamento, gestão de consentimento de cookies.
- Regras específicas da app web: `apps/web/AGENTS.md`.
