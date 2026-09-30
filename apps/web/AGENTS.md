<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Regras da app web (LockMX)

Complementam o `AGENTS.md` da raiz. O bloco acima é gerido pelo Next.js: não o editar.

## Versão e documentação

- Next.js 16 e React 19 (ver `package.json`). Convenções desta versão podem diferir do que conheces: confirmar em `node_modules/next/dist/docs/` antes de escrever código. Exemplo a verificar: o nome e o formato do ficheiro de proxy (antes `middleware.ts`).

## Estrutura

- `src/app/` só contém rotas, layouts e composição. Route groups previstos: `(marketing)`, `(shop)`, `(account)` e `(admin)`. As páginas não têm lógica de negócio.
- A lógica de negócio, o acesso a dados e as integrações (base de dados, autenticação, pagamentos, faturação) ficam em código de servidor separado da UI, protegido com `server-only`.
- Componentes recebem apenas os dados mínimos de que precisam (DTOs), nunca entidades completas com campos internos.
- A estrutura exata de `src/` é definida na spec de fundação técnica. Até lá, não criar pastas novas fora do que a spec definir.

## Servidor e cliente

- Componentes de servidor por defeito. `"use client"` só quando houver interatividade.
- Server Actions e Route Handlers validam a entrada, autenticam e autorizam no servidor, sempre.
- Variáveis de ambiente lidas apenas na camada de servidor. Manter `.env.example` atualizado (sem valores).

## Interface

- Sem cores, tamanhos ou tipografia ad hoc: usar os tokens do design system (a definir em `docs/design/`, com base na identidade visual do cliente).
- Estados de carregamento, vazio, erro e sucesso em todas as vistas de dados.
- Acessibilidade: HTML semântico, navegação por teclado e contraste adequado.
- Sem texto visível fixo nos componentes: tudo através do i18n (PT-PT e EN).
