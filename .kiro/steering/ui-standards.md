# UI Standards – MoovyZoo (Tailwind v4 + Headless UI First)

> **update:** We now **prioritize Headless UI** for interactive components (menus, dialogs, popovers, selects, tabs, disclosures, switches, etc). Tailwind v4 remains the styling engine (tokens in CSS via `@theme`) with a modular, reusable class strategy.
>
> Related docs:
>
> - **Visual Design System**: `.kiro/steering/visual-design-system.md`
> - **Component Library**: `.kiro/steering/component-library.md`

---

## Quick Reference

### Libraries & Runtime

- **Headless UI**: `@headlessui/react` (core interactive primitives)
- **Tailwind CSS v4**: design tokens with `@theme` in `src/app/globals.css`
- **PostCSS**: `@tailwindcss/postcss` in `postcss.config.mjs`
- **Helpers**: `src/styles/styles.ts` (`cn()`, variant builders)
- **Optional (advanced positioning)**: `@floating-ui/react` for custom anchored overlays when Headless UI’s built-ins aren’t enough

### Files

- **Global Tokens & Component Classes**: `src/app/globals.css`
- **Style Utilities**: `src/styles/styles.ts`
- **Feature Styles**: colocated CSS Modules for rare complex cases

> Tailwind v4 does **not** require a `tailwind.config.*` for standard use. Keep tokens in `@theme` for portability.

---

## Core Principles

1. **Headless-first composition** – Use Headless UI primitives for all stateful, accessible interactions.
2. **Tokenized styling** – Use `@theme` variables; no hardcoded hex/px in components.
3. **Reusable building blocks** – Component classes + small variant functions keep JSX clean.
4. **A11y by default** – Leverage Headless UI’s ARIA patterns; add visible focus, roles, and labels.
5. **Mobile-first, fast** – Minimal DOM, hydrate only where needed, avoid over-rendering.

---

## Architecture (Headless UI + Tailwind v4)

### Pattern

- **Structure & Accessibility**: Headless UI components control semantics, keyboard nav, focus management.
- **Look & Feel**: Tailwind v4 classes + `@theme` tokens define visuals.
- **Variants**: Type-safe helpers (e.g., `button(variant, size)`) compose a few classes per element.

### Component Layering

```
<Primitive> (Headless UI) → visual classes (Tailwind v4 tokens) → small TS variant helpers → feature composition
```

---

## Tailwind v4 Setup (recap)

\`\`

```js
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
```

\`\` (excerpt)

```css
@import "tailwindcss";

@theme {
  --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol", sans-serif;
  --color-bg: #0a0a0a; /* app bg */
  --color-surface: #141414; /* cards */
  --color-text: #ffffff; /* default text */
  --color-primary: #e50914; /* brand */
  --radius-xl: 1rem;
  --shadow-lg: 0 8px 24px 0 rgba(0, 0, 0, 0.5);

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  --animate-fade-in: fadeIn 0.2s ease-out;
}
```

\`\` (excerpt)

```ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...a: any[]) => twMerge(clsx(a));

export function button(
  variant: "primary" | "outline" = "primary",
  size: "sm" | "md" | "lg" = "md"
) {
  const v = variant === "primary" ? "btn-primary" : "btn-outline";
  const s =
    size === "sm"
      ? "px-3 py-1.5 text-sm"
      : size === "lg"
      ? "px-5 py-3 text-base"
      : "px-4 py-2 text-sm";
  return cn("btn", v, s);
}
```

---

## Headless UI Usage Standards

### Dialog (modals)

- Use `Dialog`, `DialogPanel`, `DialogTitle`, `DialogDescription`.
- Lock scroll on open; trap focus; close on overlay click **if** non-destructive.
- Sizes via variant helper; spacing via utilities.

```tsx
import { button, cn } from "@/styles/styles";

export function AppDialog({ open, onClose, title, children }: any) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 grid place-items-center p-4">
        <DialogPanel className="card w-full max-w-lg [animation:var(--animate-fade-in)]">
          <DialogTitle className="text-h3 mb-2">{title}</DialogTitle>
          <div className="mt-2">{children}</div>
          <div className="mt-6 flex justify-end gap-2">
            <button className={button("outline")}>Cancel</button>
            <button className={button("primary")}>Confirm</button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
```

### Popover/Menu (menus, kebabs, user menus)

- Prefer `Menu` for actions; `Popover` for general anchored content.
- Keep menu items keyboard-accessible; use `active` render prop for hover/focus styles.

```tsx
export function UserMenu() {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className={button("outline", "sm")}>Account</Menu.Button>
      <Menu.Items className="absolute right-0 mt-2 w-48 rounded-xl bg-[--color-surface] p-1 shadow-[--shadow-lg] focus:outline-none">
        <Menu.Item>
          {({ active }) => (
            <button
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left",
                active && "bg-white/10"
              )}
            >
              Profile
            </button>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <button
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left",
                active && "bg-white/10"
              )}
            >
              Settings
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}
```

### Listbox/Combobox (selects, searchable selects)

- Use `Listbox` for finite options; `Combobox` for large/searchable lists.
- Always label; handle empty state; support keyboard nav.

### Tabs

- Use `TabGroup`, `TabList`, `Tab`, `TabPanels`, `TabPanel`.
- Tabs are for **peer views**, not wizards (use `Stepper` pattern for that).

### Switch (toggles) & Disclosure (accordions)

- `Switch` for boolean settings with a visible label.
- `Disclosure` for collapsible sections. Preserve state where possible.

### Transition

- Prefer Headless UI `Transition` for enter/leave animations.
- Use tokenized durations/easings; respect reduced motion.

---

## Styling Rules (to avoid messy classnames)

- **Component classes first** (`btn`, `card`, `form-*`).
- **Variant helpers** for size/intent.
- **Utilities only** for layout & small tweaks (≤ 4–6 per element).
- **Never inline raw hex/px**; use tokenized arbitrary values (e.g., `bg-[--color-surface]`).
- **Colocate** tiny `.module.css` only for animation or rare complexity.

Examples:

```tsx
// ✅ Clean dialog panel styling lives in .card; spacing via short utilities
<DialogPanel className="card w-full max-w-lg">
  ...
</DialogPanel>

// ✅ Variant helpers keep buttons terse
<button className={button("primary","lg")}>Continue</button>
```

---

## Accessibility

- Headless UI covers roles, focus trapping, and keyboard controls. You must:
  - Provide **labels** (`aria-label`, visible labels, or `DialogTitle`).
  - Ensure **focus ring** visibility (`.focus-ring`).
  - Keep **contrast** ≥ 4.5:1 for text; ≥ 3:1 for large text.
  - Ensure **escape routes** (Esc closes modal; backdrop click only for non-destructive).

---

## Dark/Light Themes

- Dark-first. Light theme via attribute override:

```css
[data-theme="light"] {
  --color-bg: #ffffff;
  --color-surface: #f8f9fa;
  --color-text: #1a1a1a;
}
```

- Never hardcode color; always use tokens.

---

## Quality Checklist

- ***

## Authoring Rules for Kiro (Steering)

- Prefer **Headless UI** primitives for all interactive components.
- Generate Tailwind v4 code that **imports only** `src/app/globals.css`.
- Use **component classes** (`btn`, `card`, `form-input`, etc.) + TS helpers for variants.
- Keep inline utilities minimal and **tokenized** (e.g., `bg-[--color-surface]`).
- Avoid adding `tailwind.config.*` unless explicitly requested.
- Dark-first; no raw hex values in JSX.
- For complex anchored positioning not covered by Headless UI, use `@floating-ui/react` with tokens.
