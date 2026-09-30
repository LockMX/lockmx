# Workflow de desenvolvimento

Regras de execução para toda a equipa e para os agentes (Claude Code e Codex). O `AGENTS.md` resume-as e aponta para aqui.

## Princípios

- Nunca assumir. Cada decisão assenta na documentação oficial mais recente da versão instalada e no código existente.
- Menos é mais. Sem código especulativo, sem abstrações sem uso real.
- Uma task, um commit. O histórico deve mostrar claramente o trabalho feito.

## Ciclo de uma task

1. Ler a task na spec (`specs/`) e as decisões ligadas (`decisions/`). Se algo estiver ambíguo, perguntar antes de implementar.
2. Consultar a documentação oficial relevante para a versão instalada.
3. Escrever primeiro o teste que descreve o comportamento pedido e confirmar que falha.
4. Implementar o mínimo para o teste passar e depois limpar (refatorizar) sem alterar comportamento.
5. Verificar: lint, typecheck, testes e build, conforme o que a task afeta. Só se declara que um comando passou se foi executado.
6. Fazer o commit da task, com o código e os testes juntos.

Os testes fazem parte de cada task e seguem no commit dessa task. Uma task sem testes (configuração, documentação) indica na spec o motivo.

Comandos disponíveis hoje, a partir da raiz: `pnpm dev`, `pnpm build`, `pnpm lint`. Os comandos de testes e typecheck passam a existir com a spec de fundação técnica e são registados aqui nessa altura.

## Commits

Formato: `<tipo>: <mensagem>`

| Tipo | Quando |
|---|---|
| `feat` | Funcionalidade nova. |
| `arch` | Estrutura, configuração, ferramentas e dependências. |
| `fix` | Correção de erro. |
| `refactor` | Alteração de código sem mudar comportamento. |
| `docs` | Documentação. |

Regras:

- Mensagem curta, em inglês, no imperativo e em minúsculas (`arch: add drizzle configuration`).
- Sem menção ao modelo ou agente que fez o commit: sem `Co-Authored-By`, sem rodapés, sem "gerado por".
- Sem ícones, emojis ou símbolos gráficos.
- Um commit por task. Não misturar tasks nem incluir alterações não relacionadas.

## Branches e pull requests

Um pull request (PR) é o pedido, feito no GitHub, para juntar um branch à `main`. Mostra as alterações, corre as verificações automáticas (CI) e só depois de passarem é que o código entra.

- Depois dos passos iniciais de arranque, cada spec tem um branch: `feat/<NNN>-<assunto>`, com o mesmo identificador da spec.
- A `main` está sempre pronta a publicar. Ninguém faz commit direto na `main` depois de o CI estar ativo.
- A junção ao `main` faz-se com "rebase and merge", para manter um commit por task no histórico. Não usar "squash".
- Fazer `push`, abrir PR e fundir só acontece por pedido ou autorização explícita do responsável pelo projeto.

Até existir CI e proteção da `main`, o arranque (limpeza, documentação, regras) faz-se diretamente na `main`.

## Ações que exigem autorização explícita

`push`, abrir ou fundir PR, deploy, migrações em produção, alterações em serviços externos (GitHub, alojamento, base de dados, pagamentos, faturação) e novas dependências de produção.
