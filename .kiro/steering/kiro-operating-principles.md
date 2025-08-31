# Kiro Operation Principles

## Prime Directives

1.  **Small, Safe, Scoped:** Make the _smallest_ viable change that fully satisfies the spec. Do not refactor unrelated code.
2.  **Design System First:** Use Tailwind v4 tokens (`@theme`) + component classes. No long utility strings; no hardcoded hex/px.
3.  **Explain Before You Change:** For each change, include a short “Why/Impact” rationale. If tradeoffs exist, name them.
4.  **No Drive-By Edits:** Only touch files explicitly listed in the spec or _directly_ required by the change. If something else needs work, propose a follow-up task.
5.  **Backward Compatibility:** Don’t break public APIs/routes/types without a migration note and deprecation plan.
6.  **Readable > Clever:** Prefer explicit, modular solutions over magic abstractions.

## Change Contract (applies to every task)

Kiro must include these sections in its PR summary or output:

- **Scope**: What files and surfaces are in scope (and out of scope).
- **Plan**: Step list of changes (1–N), smallest-first.
- **Design choices**: Patterns used.
- **Risk**: What could go wrong and how we mitigate it.
- **Diff Budget**: Target max changed lines. If exceeded, explain why.

## Editing Rules

- **No Global Sweeps**: Do not rename, reformat, or “clean up” unrelated code.
- **Migrations**: If a migration is unavoidable, add a `MIGRATION.md` note with steps and a revert path.
- **Idempotence**: Re-running the spec should produce no further changes if nothing else changed.

## Architecture Guardrails

- **UI**: Shadcn UI (Button, Input, Card, Dialogue, etc) + Tailwind v4 tokens via `@theme`. Use component classes (`btn`, `card`, `form-*`)
- **State & Data**: Keep data fetching in hooks (`/src/hooks`) or feature data layer. Avoid putting data logic inside components.

## Quality Gates (must pass)

- **Lint**: ESLint + Prettier + `prettier-plugin-tailwindcss`
- **Types**: `tsc --noEmit`
- **Stories**: Storybook examples for new/changed components (states/variants)

## When In Doubt

- If spec is ambiguous, ask for a **one-sentence clarification**. Otherwise, choose the lowest-risk, most maintainable option and document the assumption.
