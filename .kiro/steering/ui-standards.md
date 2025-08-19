---
inclusion: fileMatch

fileMatch: src/components/**/*.tsx
fileMatch: src/features/**/components/*.tsx
---

# UI Standards – Zoovie (Tailwind v4 + Shadcn UI First)

> We now **prioritize Shadcn UI** for select components (tabs, dialogs, popovers, cards, input, etc). Tailwind v4 for styling engine (tokens in CSS via `@theme`) with a modular, reusable class strategy.
>
> Related docs:
>
> - **Visual Design System**: `.kiro/steering/visual-design-system.md`
> - **Component Library**: `.kiro/steering/component-library.md`

---

## Quick Reference

### Libraries & Runtime

- **Shadcn UI**: `@components/ui` for buttons, forms, inputs, labels and cards
- **Tailwind CSS v4**: design tokens with `@theme` in `src/app/globals.css`
- **PostCSS**: `@tailwindcss/postcss` in `postcss.config.mjs`

### Files

> Tailwind v4 does **not** require a `tailwind.config.*` for standard use. Keep tokens in `@theme` for portability.

---

## Core Principles

1. **Component-first composition** – Use component classes for styling. Use Shadcn default or variant styles as a starting point, and build from there.
2. **Tokenized styling** – Use `@theme` variables; no hardcoded hex/px in components.
3. **Mobile-first, fast** – Minimal DOM, hydrate only where needed, avoid over-rendering.

---

## Architecture

### Pattern

- **Look & Feel**: Tailwind v4 classes + `@theme` tokens define visuals.

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

:root {
  --font-primary: Inter, sans-serif;
  --background: /* app bg */ ;
  --primary: #DA0B0B; /* brand */
}
```

## Styling Rules (to avoid messy classnames)

- **Component-first styling** (`btn`, `card`, `form-*`).
- **Utilities only** for layout & small tweaks (≤ 4–6 per element).
- **Never inline raw hex/px**; use tokenized arbitrary values (e.g., `bg-[--color-surface]`).
- **Colocate** tiny `.module.css` only for animation or rare complexity.

## Accessibility

## Do not worry about accessibility unless prompted

## Dark/Light Themes

- Dark-first. Light theme via attribute override:

```css
[data-theme="light"] {
  --background: #ffffff;
  --foreground: #000000;
}
```

- Never hardcode color; always use tokens.

---

## Authoring Rules for Kiro (Steering)

- Prefer using **Shadcn UI** components for UI. If an installation is needed for a new component use `npx shadcn@latest add <component_name>`
- Generate Tailwind v4 code that **imports only** `src/app/globals.css`.
- Use **component classes** (`btn`, `card`, `form-input`, etc.) for variants.
- Keep inline utilities minimal and **tokenized**
- Avoid adding `tailwind.config.*` unless explicitly requested.
- Dark-first; no raw hex values in JSX.
