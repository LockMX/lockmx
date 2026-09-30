# Documentação LockMX

Toda a documentação do projeto vive em `docs/`. Este ficheiro é o índice e explica o ciclo de trabalho.

## Ciclo de trabalho

1. **Ideia** em `ideas/`: brainstorming, critérios e objetivo afinados antes de qualquer spec.
2. **Decisão** em `decisions/`: quando a ideia obriga a escolher tecnologia ou arquitetura, regista-se uma ADR.
3. **Spec** em `specs/`: tasks detalhadas e explícitas, cada uma com critérios de aceitação e testes.
4. **Implementação**: uma task, um commit, seguindo `workflow.md`.
5. **Checklist** em `checklists/`: ao concluir um módulo, regista-se o procedimento para reutilizar noutro projeto.

## Pastas

| Pasta | Conteúdo |
|---|---|
| `ideas/` | Brainstormings e critérios antes de uma spec. Ver `ideas/README.md`. |
| `decisions/` | ADRs: uma decisão por ficheiro, com contexto, alternativas e fontes. Ver `decisions/README.md`. |
| `specs/` | Specs com tasks. Ver `specs/README.md`. |
| `checklists/` | Procedimentos por módulo, para reutilizar noutros projetos. Ver `checklists/README.md`. |
| `workflow.md` | Regras de execução de cada task: commits, testes, branches. |

Pastas a criar apenas quando houver conteúdo real: `architecture/`, `design/` (design system), `integrations/` (pagamentos, faturação), `compliance/` (RGPD, cookies, textos legais), `runbooks/` (deploy, backups, incidentes).

## Regras da documentação

- Escrita em português (PT-PT). Código, comentários e mensagens de commit em inglês.
- Uma fonte de verdade por assunto. Não duplicar: apontar para o ficheiro que já o explica.
- Toda a afirmação técnica indica a fonte consultada e a data. Nunca assumir.
- Um valor externo (preços, comissões, prazos legais) só entra depois de verificado na fonte oficial.
