# Specs

A spec describes a feature or module in detailed, explicit tasks. It is only written after the idea is refined in `ideas/` and the necessary decisions are in `decisions/`.

File name: `NNN-<subject>.md`, sequentially numbered (`001-technical-foundation.md`). The working branch uses the same identifier: `feat/001-technical-foundation`.

## Template

```md
# NNN. <Title>

- Status: draft | approved | in progress | done
- Idea: link to `ideas/...`
- Decisions: links to `decisions/...`

## Objective

## Out of scope
What this spec does not cover.

## Sources
Official documentation consulted, with URL and consultation date.

## Tasks

### T1. <Title>
- Description: what to do, explicitly.
- Planned files:
- Acceptance criteria:
- Tests: the tests that go with the task (or "no tests" and the reason).
- Commit: `<type>: <message>`
```

Each task is independent and leaves the project compiling with the tests passing.
