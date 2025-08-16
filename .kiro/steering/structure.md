# Structure Steering - Surfboard

## Feature Architecture

Each feature follows a modular, responsibility-based structure:

```
.
├─ app/                                  # Next.js routes, layouts, and server/page components
│  ├─ (marketing)/                       # Optional: marketing/public pages route group
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ (app)/                             # Auth-protected app route group
│  │  ├─ layout.tsx
│  │  ├─ page.tsx                        # Home feed / dashboard
│  │  ├─ login/
│  │  │  └─ page.tsx
│  │  ├─ signup/
│  │  │  └─ page.tsx
│  │  ├─ habitats/
│  │  │  ├─ page.tsx
│  │  │  └─ [id]/page.tsx
│  │  ├─ parties/
│  │  │  ├─ page.tsx
│  │  │  └─ [id]/page.tsx
│  │  ├─ profile/
│  │  │  ├─ page.tsx
│  │  │  └─ edit/page.tsx
│  │  ├─ games/
│  │  │  ├─ binge-race/page.tsx
│  │  │  └─ in-character/page.tsx
│  │  └─ api/                            # Optional: Next.js route handlers (only if needed)
│  │     └─ revalidate/route.ts
│  ├─ globals.css
│  └─ middleware.ts                      # Auth/role guards (redirects)
│
├─ components/                           # Reusable, app-wide UI components (PascalCase)
│  ├─ UI/
│  │  ├─ Button/
│  │  │  ├─ Button.tsx
│  │  │  └─ index.ts
│  │  ├─ Input/
│  │  ├─ Modal/
│  │  └─ ...
│  ├─ forms/                             # Generic form shells/helpers used across features
│  │  ├─ FormLayout.tsx
│  │  ├─ RHFInput.tsx
│  │  └─ RHFSelect.tsx
│  └─ layout/
│     ├─ AppShell.tsx
│     └─ NavBar.tsx
│
├─ features/                             # Feature modules (vertical slices)
│  ├─ auth/
│  │  ├─ components/                     # Feature-specific components (PascalCase)
│  │  │  ├─ LoginForm.tsx
│  │  │  └─ SignupForm.tsx
│  │  ├─ domain/                         # Business logic: types, schemas, service
│  │  │  ├─ auth.types.ts
│  │  │  ├─ auth.schema.ts
│  │  │  └─ auth.service.ts              # orchestrates supabase auth calls
│  │  ├─ data/                           # Data access only (repositories/clients)
│  │  │  └─ auth.repository.ts
│  │  ├─ hooks/
│  │  │  └─ useAuth.ts                   # UI-level hook (calls service)
│  │  └─ index.ts
│  │
│  ├─ profiles/
│  │  ├─ components/
│  │  │  ├─ ProfileForm.tsx
│  │  │  └─ ProfileCard.tsx
│  │  ├─ domain/
│  │  │  ├─ profiles.types.ts
│  │  │  ├─ profiles.zod.ts
│  │  │  └─ profiles.service.ts
│  │  ├─ data/
│  │  │  ├─ profiles.repository.ts       # Supabase queries only
│  │  │  └─ supabase-client.ts           # Supabase singleton (kebab-case)
│  │  ├─ hooks/
│  │  │  ├─ useProfile.ts
│  │  │  └─ usePublicProfiles.ts
│  │  └─ index.ts
│  │
│  ├─ habitats/                          # Group chats
│  │  ├─ components/
│  │  ├─ domain/                         # habitats.types.ts, habitats.zod.ts, habitats.service.ts
│  │  ├─ data/                           # habitats.repository.ts
│  │  ├─ hooks/
│  │  └─ index.ts
│  │
│  ├─ parties/                           # Watch parties
│  │  ├─ components/
│  │  ├─ domain/
│  │  ├─ data/
│  │  ├─ hooks/
│  │  └─ index.ts
│  │
│  ├─ ai/                                # AI Discussion Mode
│  │  ├─ components/
│  │  ├─ domain/                         # prompts, schemas, service
│  │  ├─ data/                           # calls to your AI provider
│  │  ├─ hooks/
│  │  └─ index.ts
│  │
│  ├─ games/                             # Binge Race, In-Character
│  │  ├─ components/
│  │  ├─ domain/                         # games.types.ts, .zod.ts, .service.ts
│  │  ├─ data/                           # games.repository.ts
│  │  ├─ hooks/
│  │  └─ index.ts
│  │
│  └─ recommendations/
│     ├─ components/
│     ├─ domain/                         # recs.types.ts, .zod.ts, .service.ts
│     ├─ data/                           # recs.repository.ts
│     ├─ hooks/
│     └─ index.ts
│
├─ hooks/                                # Global, cross-feature hooks (rare)
│  ├─ useDebounce.ts
│  ├─ useMediaQuery.ts
│
├─ lib/                                  # Framework/glue code that is not a feature
│  ├─ cn.ts                               # className util or use 'clsx'
│  ├─ env.ts                              # zod-validated env loader
│  ├─ routes.ts                           # centralized route helpers
│  └─ logger.ts
│
├─ utils/                                # Small, pure helpers (kebab-case)
│  ├─ error-codes.ts
│  ├─ normalize-error.ts
│  ├─ validation.ts
│  └─ date-format.ts
│
├─ types/                                # Global shared types (only if truly cross-feature)
│  └─ global.d.ts
│
├─ styles/
│  ├─ globals.css
│  ├─ tokens.css                          # CSS variables from visual design system
│  └─ tailwind.css                        # if you separate it
│
├─ public/
│  ├─ icons/
│  ├─ images/
│  └─ logo.svg
│
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ e2e/
│
├─ .kiro/                         # Kiro steering + standards
│  └─ steering/
│     ├─ visual-design-system.md
│     ├─ naming-conventions.md
│     ├─ form-system-architecture.md
│     ├─ tech.md                      # overall architecture notes
│     ├─ api-standards.md
│     ├─ testing-standards.md
│     ├─ code-conventions.md
│     ├─ security-policies.md
│     └─ deployment-workflow.md
│
├─ postcss.config.mjs          # ESM with @tailwindcss/postcss
├─ tailwind.config.ts
├─ tsconfig.json               # set path aliases like "@/*"
└─ package.json

```

## Rules

- **Split by responsibility** (small, focused files)
- **data/** only contains Supabase SDK calls
- **domain/** contains business logic and validation
- **hooks/** contains React hooks and UI logic
- **utils/** contains shared error handling and validation
- No cross-feature imports except via /components or /lib
- Always use errorMap from error-map.ts for user-facing messages
- Normalize all errors to AppErrorCode before showing to users
