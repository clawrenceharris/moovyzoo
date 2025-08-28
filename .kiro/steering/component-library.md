---
inclusion: fileMatch

fileMatch: "src/components/**/*.tsx"
fileMatch: "src/features/**/components/*.tsx"

---

# Component Library – Zoovie

> Modular, reusable component architecture that promotes consistency, maintainability, and developer productivity.
>
> Related docs:
>
> - **UI Standards**: `.kiro/steering/ui-standards.md`
> - **Visual Design System**: `.kiro/steering/visual-design-system.md`
> - **Structure**: `.kiro/steering/structure.md`

---

## Architecture Overview

The Zoovie component library follows a three-tier architecture:

1. **Base UI Components** (`/components/ui/`) - Shadcn UI foundation
2. **Shared Components** (`/components/states/`, `/components/cards/`) - Reusable application components
3. **Feature Components** (`/features/*/components/`) - Feature-specific compositions

## Component Categories

### State Components (`/components/states/`)

Standardized components for common UI states across the application.

#### LoadingState

- **Purpose**: Consistent loading indicators for different layouts
- **Variants**: `grid`, `list`, `inline`, `card`
- **Usage**: Replace inline loading spinners with standardized component

```tsx
import { LoadingState } from '@/components/states';

<LoadingState variant="grid" count={6} />
<LoadingState variant="list" count={3} />
```

#### ErrorState

- **Purpose**: Consistent error display with retry functionality
- **Features**: Customizable messages, retry buttons, different variants
- **Usage**: Replace inline error messages with standardized component

```tsx
import { ErrorState } from "@/components/states";

<ErrorState
  message="Failed to load habitats"
  onRetry={handleRetry}
  variant="card"
/>;
```

#### EmptyState

- **Purpose**: Consistent empty state display with configurable actions
- **Features**: Custom icons, titles, descriptions, action buttons
- **Usage**: Replace inline empty messages with standardized component

```tsx
import { EmptyState } from "@/components/states";

<EmptyState
  title="No discussions yet"
  description="Start the conversation!"
  action={<Button onClick={createDiscussion}>Create Discussion</Button>}
/>;
```

### Card Components (`/components/cards/`)

Domain-specific card components for displaying different content types.

#### HabitatCard

- **Purpose**: Display habitat information with cinematic styling
- **Features**: Banner images, member counts, hover effects, CTA buttons

#### DiscussionCard

- **Purpose**: Display discussion information in lists
- **Features**: Message counts, last activity indicators, click handling

#### PollCard

- **Purpose**: Display poll information with voting status
- **Features**: Vote counts, user participation status, results display

#### WatchPartyCard

- **Purpose**: Display watch party information and scheduling
- **Features**: Live status, participant counts, time display

```tsx
import { HabitatCard, DiscussionCard, PollCard, WatchPartyCard } from '@/components/cards';

<HabitatCard habitat={habitat} onClick={navigateToHabitat} />
<DiscussionCard discussion={discussion} showStats />
<PollCard poll={poll} showResults />
<WatchPartyCard watchParty={party} showParticipants />
```

## Design Principles

### Single Responsibility

Each component has one clear purpose and handles one specific UI concern.

### Composition Over Inheritance

Build complex components by composing smaller, focused components rather than creating monolithic components with internal subcomponents.

### Consistent Interfaces

Similar components follow predictable prop patterns:

```tsx
// Base props for all card components
interface BaseCardProps {
  className?: string;
  onClick?: () => void;
}

// State component variants
type StateVariant = "grid" | "list" | "inline" | "card";
```

### Prop Flexibility

Components accept optional props for customization while providing sensible defaults:

```tsx
interface LoadingStateProps {
  variant?: StateVariant; // Default: "grid"
  count?: number; // Default: 3
  className?: string; // For custom styling
}
```

## Implementation Guidelines

### Component Structure

Each shared component follows this structure:

```
/components/states/LoadingState/
├── LoadingState.tsx          # Main component
├── LoadingState.test.tsx     # Unit tests
├── LoadingState.stories.tsx  # Storybook stories
└── index.ts                  # Re-export
```

### Barrel Exports

Use barrel exports for clean imports:

```tsx
// /components/states/index.ts
export { LoadingState } from "./LoadingState";
export { ErrorState } from "./ErrorState";
export { EmptyState } from "./EmptyState";

// /components/index.ts
export * from "./states";
export * from "./cards";
export * from "./ui";
```

### Testing Requirements

All shared components must have:

- Unit tests covering all variants and props
- Storybook stories for visual documentation
- Accessibility testing where applicable

### Styling Standards

- Use component classes from `globals.css` for consistent styling
- Support `className` prop for custom styling
- Follow design system tokens and color palette
- Implement proper hover states and transitions

## Migration Guidelines

### Extracting Subcomponents

When refactoring existing components:

1. **Identify reusable patterns** - Look for repeated UI patterns across components
2. **Extract to shared location** - Move to appropriate `/components/` subdirectory
3. **Update imports** - Replace inline components with shared imports
4. **Maintain functionality** - Ensure existing behavior is preserved
5. **Add tests** - Create comprehensive test coverage for extracted components

### Avoiding Anti-Patterns

- **No subcomponents in component files** - Extract to shared components instead
- **No deep component nesting** - Keep composition shallow and clear
- **No feature-specific logic in shared components** - Keep them pure and reusable
- **No hardcoded styles** - Use design system tokens and component classes

## Quality Standards

### Before Shipping Components

- [ ] Component has single, clear responsibility
- [ ] Props interface is consistent with similar components
- [ ] All variants and edge cases are tested
- [ ] Storybook stories document all use cases
- [ ] Follows design system styling standards
- [ ] Supports customization via className prop
- [ ] Has proper TypeScript interfaces and JSDoc comments

### Performance Considerations

- Components support tree-shaking for unused variants
- Minimal re-renders through proper prop design
- Efficient DOM structure with semantic HTML
- Optimized for bundle size and runtime performance

## Examples

### Before: Inline Subcomponents

```tsx
// ❌ Anti-pattern: Subcomponents in file
function HabitatList() {
  const LoadingCard = () => <div className="animate-pulse">...</div>;
  const ErrorMessage = () => <div className="text-red-500">...</div>;

  if (loading) return <LoadingCard />;
  if (error) return <ErrorMessage />;
  // ...
}
```

### After: Composed Shared Components

```tsx
// ✅ Good: Composed from shared components
import { LoadingState, ErrorState } from "@/components/states";
import { HabitatCard } from "@/components/cards";

function HabitatList() {
  if (loading) return <LoadingState variant="grid" count={6} />;
  if (error) return <ErrorState message="Failed to load" onRetry={refetch} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {habitats.map((habitat) => (
        <HabitatCard key={habitat.id} habitat={habitat} onClick={navigate} />
      ))}
    </div>
  );
}
```

This approach promotes:

- **Consistency** across the application
- **Reusability** of common patterns
- **Maintainability** through centralized components
- **Testability** with focused, isolated components
- **Developer productivity** through predictable interfaces
