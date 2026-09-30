# Decisions (ADRs)

One architecture or technology decision per file. They record the why, so it does not have to be rediscovered later.

File name: `NNNN-<subject>.md`, sequentially numbered (`0001-orm-drizzle.md`).

An ADR is never deleted. If the decision changes, a new ADR is created and the old one becomes `superseded by NNNN`.

## Template

```md
# NNNN. <Title>

- Status: proposed | accepted | superseded by NNNN
- Date: YYYY-MM-DD

## Context
The problem and the constraints.

## Decision
What was decided.

## Alternatives considered
Each one with the reason it was not chosen.

## Consequences
What becomes easier and what becomes harder.

## Sources
Official documentation consulted, with URL and consultation date.
```
