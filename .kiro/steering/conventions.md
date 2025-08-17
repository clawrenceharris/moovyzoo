# Zoovie Naming Conventions (Next.js + TypeScript)

This document defines file and folder naming conventions for the Zoovie project, aligned with common Next.js and modern TypeScript/React best practices.

---

## 1. General Principles

- **Lowercase with hyphens (kebab-case)** for all non-component file and folder names.
- **PascalCase** for React component files and their containing folders.
- **camelCase** only for variables, functions, and hook names in code — never for file names.
- Keep names **descriptive** and avoid abbreviations unless widely recognized (e.g., `api`, `ui`).

- Prefer `clsx` to compose base + variant classes instead of long inline lists.
- Shared/repeatable styles go into `/styles/styles.ts` as exported constants.
- Global patterns (buttons, cards, badges) go into `globals.css` using `@apply`.
- Use `prettier-plugin-tailwindcss` to auto-sort utilities.
- Limit inline classes to small adjustments; extract larger style sets.

---

## 2. File Naming Rules

| Type                       | Case Style | Example                   |
| -------------------------- | ---------- | ------------------------- |
| React Components           | PascalCase | `AuthLayout.tsx`          |
| Hooks                      | kebab-case | `auth-hooks.ts`           |
| Utilities/Helpers          | kebab-case | `supabase-client.ts`      |
| API Route Files            | kebab-case | `get-profile.ts`          |
| Stylesheets (CSS/Tailwind) | kebab-case | `profile-form.module.css` |
| Config Files               | kebab-case | `tailwind.config.ts`      |
| Type Definitions           | kebab-case | `profile.types.ts`        |
| Test Files                 | kebab-case | `profile-form.test.tsx`   |
| Constants                  | kebab-case | `api-endpoints.ts`        |

---

## 3. Folder Naming Rules

- **Components** folder: PascalCase for each component's folder (matching its main file name).
- **Feature Modules**: kebab-case for feature folders, PascalCase inside only for components.
- **Shared** or **UI** folders: PascalCase for reusable components.

Example:

```
/features/auth-profiles/
├── components/
│   ├── AuthLayout/
│   │   ├── AuthLayout.tsx
│   │   └── AuthLayout.module.css
│   ├── SignupForm/
│   │   ├── SignupForm.tsx
│   │   └── SignupForm.module.css
├── hooks/
│   ├── use-auth.ts
│   ├── use-profile.ts
├── utils/
│   ├── supabase-client.ts
│   ├── validation.ts
```

---

## 4. Special Cases

- **Index files**: For component folders, use `index.tsx` to re-export the main component.  
  Example: `/AuthLayout/index.tsx` exports `AuthLayout`.
- **Barrel exports**: Allowed in feature or shared component folders, named `index.ts`.
- **Avoid deep nesting** beyond 3 levels\*\* unless justified by feature complexity.

---

## 5. Summary Table

| Element Type | Naming Style                                        |
| ------------ | --------------------------------------------------- |
| Components   | PascalCase                                          |
| Hooks        | kebab-case                                          |
| Utilities    | kebab-case                                          |
| API Routes   | kebab-case                                          |
| Styles       | kebab-case                                          |
| Types        | kebab-case                                          |
| Constants    | kebab-case                                          |
| Config Files | kebab-case                                          |
| Folders      | kebab-case (except component folders in PascalCase) |
