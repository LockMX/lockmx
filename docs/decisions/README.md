# Decisions (ADRs)

Uma decisão de arquitetura ou tecnologia por ficheiro. Registam o porquê, para não ser preciso redescobrir mais tarde.

Nome do ficheiro: `NNNN-<assunto>.md`, com numeração sequencial (`0001-orm-drizzle.md`).

Uma ADR nunca é apagada. Se a decisão mudar, cria-se uma nova ADR e a antiga passa a `substituída por NNNN`.

## Modelo

```md
# NNNN. <Título>

- Estado: proposta | aceite | substituída por NNNN
- Data: AAAA-MM-DD

## Contexto
O problema e as restrições.

## Decisão
O que ficou decidido.

## Alternativas consideradas
Cada uma com o motivo de não ter sido escolhida.

## Consequências
O que passa a ser mais fácil e mais difícil.

## Fontes
Documentação oficial consultada, com URL e data de consulta.
```
