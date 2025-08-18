# Structure Steering - Zoovie

## Feature Architecture

Each feature follows a modular, responsibility-based structure:

```
.
├─ app/                                  # Next.js routes, layouts, and server/page components
│  ├─ (app)/                             # Auth-protected app route group
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
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
│  │  │  └─ revalidate/route.ts
│  ├─ globals.css
│  └─ middleware.ts                      # Auth/role guards (redirects)
├─ components/                           # Reusable, app-wide UI components (PascalCase)
│  ├─ ui/
│  │  ├─ Modal/
│  │  └─ ...
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
│  │  │  └─ useAuth.ts
│  │  └─ index.ts
│  │
│  ├─ profiles/
│  │  ├─ components/
│  │  │  ├─ ProfileForm.tsx
│  │  │  └─ ProfileCard.tsx
│  │  ├─ domain/
│  │  │  ├─ profiles.types.ts
│  │  │  ├─ profiles.schema.ts           #zod schemas only
│  │  │  └─ profiles.service.ts
│  │  ├─ data/
│  │  │  ├─ profiles.repository.ts       # Supabase queries only
│  │  │  └─ supabase-client.ts           # Supabase singleton (kebab-case)
│  │  ├─ hooks/
│  │  │  ├─ useProfile.ts
│  │  │  └─ usePublicProfiles.ts
│  │  └─ index.ts
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
├─ types/                                # Global shared types (only if truly cross-feature)
│  └─ global.d.ts
├─ tests/
│  ├─ unit/
│  ├─ integration/
├─ postcss.config.mjs          # ESM with @tailwindcss/postcss
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
