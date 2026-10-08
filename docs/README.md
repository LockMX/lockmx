# LockMX documentation

All project documentation lives in `docs/`. This file is the index and explains the working cycle.

## Working cycle

1. **Idea** in `ideas/`: brainstorming, criteria and objective refined before any spec.
2. **Decision** in `decisions/`: when an idea forces a technology or architecture choice, an ADR is recorded.
3. **Spec** in `specs/`: detailed, explicit tasks, each with acceptance criteria and tests.
4. **Implementation**: one task, one commit, following `workflow.md`.
5. **Checklist** in `checklists/`: when a module is finished, the procedure is recorded so it can be reused in another project.

## Structure

| Path | Content |
|---|---|
| `ideas/` | Brainstorming and criteria before a spec. See `ideas/README.md`. |
| `decisions/` | ADRs: one decision per file, with context, alternatives and sources. See `decisions/README.md`. |
| `specs/` | Specs with tasks. See `specs/README.md`. |
| `checklists/` | Per-module procedures, reusable in other projects. See `checklists/README.md`. |
| `compliance/` | Legal and regulatory requirements with sources and open points. See `compliance/README.md`. |
| `integrations/` | Operational setup of external services. Now: `aws-ses-mailboxes.md` (mailbox receiving and forwarding). |
| `design/` | The design system: foundations, accessibility, components and brand. See `design/README.md`. |
| `workflow.md` | Rules for executing each task: commits, tests, branches. |
| `architecture.md` | Current structure, layers and boundaries, linking to the ADRs behind each choice. |

Created only when there is real content: further `integrations/` files (payments, invoicing) and `runbooks/` (deploy, backups, incidents).

## Documentation rules

- Everything is written in English, always: documentation, code comments, identifiers and commit messages. Only user-facing text is translated, through i18n.
- One source of truth per subject. Do not duplicate: point to the file that already explains it.
- Every technical claim states the source consulted and the date. Never assume.
- An external value (prices, fees, legal deadlines) only enters after being verified at the official source.
