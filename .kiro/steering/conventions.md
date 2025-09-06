---
inclusion: manual

---
# Zoovie Coding + Naming Conventions (Next.js + TypeScript)

This document defines file and folder naming conventions for the Zoovie project, aligned with common Next.js and modern TypeScript/React best practices.

---

## 1. General Principles

- **Lowercase with hyphens (kebab-case)** for all non-component file and folder names.
- **PascalCase** for React component files and their containing folders.
- **camelCase** only for variables, functions, and hook names in code — never for file names.
- Keep names **descriptive** and avoid abbreviations unless widely recognized (e.g., `api`, `ui`).

## 3. Folder Naming Rules

- **Components** folder: PascalCase for each component's folder
- **Feature Modules**: kebab-case for feature folders, PascalCase inside only for components.
- **Shared** or **UI** folders: PascalCase for reusable components.
- **Component categories**: Organize shared components by purpose (`states/`, `cards/`, `ui/`)

Example:

```
/features/auth/
├── components/
│   ├── AuthLayout/
│   │   ├── AuthLayout.tsx
│   │   └── AuthLayout.module.css
│   ├── SignupForm/
│   │   ├── SignupForm.tsx
│   │   └── SignupForm.module.css
├── hooks/
│   ├── useAuth.ts
├── utils/
│   ├── error-map.ts
│   ├── validation.ts
```

### Shared Component Organization

```
/components/
├── ui/                          # Shadcn UI base components
│   ├── Button.tsx
│   ├── Input.tsx
│   └── index.ts
├── states/                      # Reusable state components
│   ├── LoadingState.tsx
│   ├── ErrorState.tsx
│   ├── EmptyState.tsx
│   └── index.ts
├── cards/                       # Domain-specific cards
│   ├── HabitatCard.tsx
│   ├── DiscussionCard.tsx
│   ├── PollCard.tsx
│   └── index.ts
└── index.ts                     # Main barrel export
```

---

## 4. Special Cases

- **Index files**: For component folders, use `index.tsx` to re-export the main component.  
  Example: `/AuthLayout/index.tsx` exports `AuthLayout`.
- **Barrel exports**: Allowed in feature or shared component folders, named `index.ts`.
- **Avoid deep nesting** beyond 3 levels unless justified by feature complexity.

## 5. Component Extraction Guidelines

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
