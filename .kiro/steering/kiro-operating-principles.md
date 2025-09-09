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

### Important!! Test-Driven Development (TDD) - MANDATORY

**Requirement:** All code must be developed using strict Test-Driven Development practices.

#### TDD Cycle (Red-Green-Refactor)

1. **Red:** Write a failing test that describes the desired behavior
2. **Green:** Write the minimal code to make the test pass
3. **Refactor:** Improve code quality while keeping tests green

#### TDD Implementation Rules

- **No Production Code:** Write no production code without a failing test
- **Minimal Test Code:** Write only enough test code to demonstrate a failure
- **Minimal Production Code:** Write only enough production code to pass the failing test
- **Test First:** Always write tests before implementation code
- **Full Test Suite:** The complete test suite MUST be passing before marking any task as complete

## Things to Avoid:

- Do not run `npm run test:unit` or similar command. This throws an error.
- Instead run `npm run test *` command.

## Architecture Guardrails

- **UI**: Shadcn UI (Button, Input, Card, Dialogue, etc) + Tailwind v4 tokens via `@theme`. Use component classes (`btn`, `card`, `form-*`)
- **State & Data**: Keep data fetching in hooks (`/src/hooks`) or feature data layer. Avoid putting data logic inside components.

## Component Extraction Guidelines

### When to Extract Components

Extract components to shared locations when:

- The same UI pattern appears in multiple places
- A component has clear, single responsibility
- The component can be reused across different features
- Subcomponents are declared inside other component files

### Extraction Process

1. **Identify the pattern**: Look for repeated UI elements or subcomponents
2. **Choose the right category**:
   - `/components/states/` for loading, error, empty states
   - `/components/cards/` for content display cards
   - `/components/ui/` for base UI elements
3. **Create proper structure**: Component file, tests, stories, and index export
4. **Update imports**: Replace inline usage with shared component imports
5. **Maintain functionality**: Ensure existing behavior is preserved

### Anti-Patterns to Avoid

```tsx
// ❌ Don't: Subcomponents in files
function ParentComponent() {
  const SubComponent = () => <div>...</div>;
  return <SubComponent />;
}

// ✅ Do: Extract to shared component
import { SubComponent } from "@/components/category";
function ParentComponent() {
  return <SubComponent />;
}
```

## Quality Gates (must pass)

- **Lint**: ESLint + Prettier + `prettier-plugin-tailwindcss`
- **Types**: `tsc --noEmit`
- **Stories**: Storybook examples for new/changed components (states/variants)

## When In Doubt

- If spec is ambiguous, ask for a **one-sentence clarification**. Otherwise, choose the lowest-risk, most maintainable option and document the assumption.
