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
│  ├─ globals.css
│  └─ middleware.ts                      # Auth/role guards (redirects)
├─ components/                           # Reusable, app-wide UI components (PascalCase)
│  ├─ ui/                                # Shadcn UI components (Button, Input, Card, etc.)
│  │  ├─ button.tsx
│  │  ├─ input.tsx
│  │  ├─ card.tsx
│  │  └─ ...
│  ├─ states/                            # Reusable state components
│  │  ├─ LoadingState.tsx               # Standardized loading indicators
│  │  ├─ ErrorState.tsx                 # Consistent error display with retry
│  │  ├─ EmptyState.tsx                 # Configurable empty state display
│  │  └─ index.ts                       # Barrel exports
│  ├─ cards/                            # Domain-specific card components
│  │  ├─ HabitatCard.tsx               # Habitat display cards
│  │  ├─ DiscussionCard.tsx            # Discussion display cards
│  │  ├─ PollCard.tsx                  # Poll display cards
│  │  ├─ WatchPartyCard.tsx            # Watch party display cards
│  │  └─ index.ts                       # Barrel exports
│  └─ index.ts                          # Main barrel export for all shared components
├─ features/                             # Feature modules (vertical slices)
│  ├─ profiles/
│  │  ├─ components/
│  │  │  ├─ ProfileForm.tsx
│  │  │  └─ ProfileCard.tsx
│  │  ├─ domain/
│  │  ├─ __tests__/
│  │  │  ├─ profiles.repository.test.ts
│  │  │  ├─ profiles.types.ts
│  │  │  ├─ profiles.schema.ts           #zod schemas only
│  │  │  └─ profiles.service.ts
│  │  ├─ data/
│  │  │  ├─ profiles.repository.ts       # Supabase queries only
│  │  ├─ hooks/
│  │  │  ├─ use-profile.ts
│  │  └─ index.ts
├─ hooks/                                # Global, cross-feature hooks (rare)
│  ├─ use-debounce.ts
│  ├─ use-media-search.ts
├─ lib/                                  # Framework/glue code that is not a feature
│  ├─ cn.ts                               # className util or use 'clsx'
│  ├─ env.ts                              # zod-validated env loader
│  ├─ routes.ts                           # centralized route helpers│
├─ utils/                                # Small, pure helpers (kebab-case)
│  ├─ error-codes.ts
│  ├─ normalize-error.ts
│  ├─ validators.ts
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

## Component Architecture Principles

### Modular, Reusable Design

- **Extract common patterns**: Shared components live in `/src/components/` organized by purpose
- **Single responsibility**: Each component has one clear purpose and responsibility
- **Composition over inheritance**: Build complex components by composing smaller, focused components
- **Consistent interfaces**: Similar components follow predictable prop patterns and naming conventions

### Component Categories

1. **UI Components** (`/components/ui/`): Shadcn UI base components (Button, Input, Card)
2. **State Components** (`/components/states/`): Reusable loading, error, and empty states
3. **Card Components** (`/components/cards/`): Domain-specific display cards for different content types
4. **Feature Components** (`/features/*/components/`): Feature-specific components that compose shared components

### Component Composition Rules

- **Parent components** handle data flow and business logic only
- **Child components** are pure and focused on presentation
- **Use barrel exports** (`index.ts`) for clean imports across the application
- **Avoid subcomponents** declared inside other component files - extract to shared components instead

## File Organization Rules

- **Split by responsibility** (small, focused files)
- **data/** only contains Supabase SDK calls
- **domain/** contains business logic and validation
- **hooks/** contains React hooks and UI logic
- **utils/** contains shared error handling and validation
- No cross-feature imports except via /components or /lib
- Always use errorMap from error-map.ts for user-facing messages
- Normalize all errors to AppErrorCode before showing to users
