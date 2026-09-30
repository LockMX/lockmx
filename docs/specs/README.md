# Specs

Uma spec descreve uma funcionalidade ou módulo em tasks detalhadas e explícitas. Só se escreve depois de a ideia estar afinada em `ideas/` e de as decisões necessárias estarem em `decisions/`.

Nome do ficheiro: `NNN-<assunto>.md`, com numeração sequencial (`001-fundacao-tecnica.md`). O branch de trabalho usa o mesmo identificador: `feat/001-fundacao-tecnica`.

## Modelo

```md
# NNN. <Título>

- Estado: rascunho | aprovada | em curso | concluída
- Ideia: ligação para `ideas/...`
- Decisões: ligações para `decisions/...`

## Objetivo

## Fora de âmbito
O que esta spec não cobre.

## Fontes
Documentação oficial consultada, com URL e data de consulta.

## Tasks

### T1. <Título>
- Descrição: o que fazer, de forma explícita.
- Ficheiros previstos:
- Critérios de aceitação:
- Testes: os testes que acompanham a task (ou "sem testes" e o motivo).
- Commit: `<tipo>: <mensagem>`
```

Cada task é independente e deixa o projeto a compilar e com os testes a passar.
