# Design Document

## Overview

The onboarding wizard is a multi-step guided flow that activates immediately after successful user signup. It leverages the existing `useOnboarding` hook and integrates seamlessly with the current auth flow, profile system, and visual design standards. The wizard will collect essential user preferences (genres, movie quote, avatar) and create a personalized experience while maintaining the app's cinematic aesthetic.

The design builds upon existing patterns in the codebase, utilizing the established form architecture, error handling standards, and the existing onboarding hook infrastructure that's already partially implemented.

## Architecture

### High-Level Flow

1. **Signup Completion** → Automatic redirect to onboarding wizard
2. **Onboarding Wizard** → Multi-step form with progress tracking
3. **Data Collection** → Genre preferences, profile setup, avatar upload
4. **Completion** → Profile added to database and redirect to main app

### Integration Points

- **Auth Flow**: Integrates with existing signup process in `src/app/auth/signup/page.tsx`
- **Profile System**: Uses `profilesService` to save onboarding data
- **Form Architecture**: Leverages `FormLayout` component and form standards
- **State Management**: Utilizes existing `useOnboarding` hook with enhancements
- **Error Handling**: Follows established error normalization patterns

## Components and Interfaces

### Core Components

#### 1. OnboardingWizard (Container Component)

**Location**: `src/features/auth/components/OnboardingWizard.tsx`

- Main container component that orchestrates the entire flow
- Manages step transitions and progress tracking
- Handles completion and skip functionality
- Integrates with `useOnboarding` hook

```typescript
interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}
```

#### 2. OnboardingStep Components

**Location**: `src/features/auth/components/onboarding/`

**WelcomeStep.tsx**

- Welcome screen with app introduction
- Progress indicator initialization
- Continue/Skip options

**GenreSelectionStep.tsx**

- Visual genre grid with movie/TV categories
- Multi-select functionality with minimum 3 selections
- Genre data from existing `Genre` interface

**ProfileSetupStep.tsx**

- Display name input with validation
- Display name and favorite movie quote fields
- Form validation using existing patterns

**AvatarUploadStep.tsx**

- Profile picture upload functionality
- Camera/gallery selection on mobile
- Image preview and validation
- Integration with Supabase Storage

#### 3. Supporting Components

**OnboardingProgress.tsx**

- Visual progress indicator
- Step navigation breadcrumbs
- Current step highlighting

**GenreCard.tsx**

- Individual genre selection card
- Visual feedback for selection state
- Cinematic hover animations

### Enhanced Hook Interface

The existing `useOnboarding` hook will be enhanced to support the full wizard flow:

```typescript
interface UseOnboardingReturn {
  // Existing state
  currentStep: OnboardingStep;
  data: Partial<OnboardingData>;
  progress: number;

  // Enhanced navigation
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: OnboardingStep) => void;

  // Actions
  updateData: (updates: Partial<OnboardingData>) => void;
  completeOnboarding: () => Promise<void>;
  skipOnboarding: () => void;

  // Loading states
  isCompleting: boolean;
  completionError: Error | null;
}
```

## Data Models

### Enhanced OnboardingData Interface

```typescript
interface OnboardingData {
  // Required fields
  displayName: string;
  favoriteGenres: string[];

  // Optional fields
  avatarUrl?: string;
  quote?: string;

  // Metadata
  completedAt?: Date;
  skippedSteps?: OnboardingStep[];
}
```

### OnboardingStep Enum (Enhanced)

```typescript
enum OnboardingStep {
  WELCOME = "welcome",
  GENRE_SELECTION = "genre_selection",
  PROFILE_SETUP = "profile_setup",
  AVATAR_UPLOAD = "avatar_upload",
}
```

### Genre Data Structure

Leverages existing `Genre` interface from `src/types/movie.ts`:

```typescript
interface Genre {
  id: string;
  name: string;
  tmdbId: number;
  description: string;
  iconUrl?: string;
  isActive: boolean;
}
```

## Error Handling

### Validation Rules

- **Display Name**: 3-30 characters, alphanumeric + spaces/hyphens/underscores
- **Genre Selection**: None
- **Avatar Upload**: Max 5MB, supported formats: JPG, PNG, WebP

### Error States

- Network connectivity issues during data submission
- File upload failures for avatar
- Validation errors with inline feedback
- Server errors with retry mechanisms

All errors will be normalized using the existing `normalizeError` utility and displayed using the established `getFriendlyErrorMessage` method.

## Testing Strategy

### Unit Tests

- **Hook Testing**: `useOnboarding` state management and validation logic
- **Component Testing**: Individual step components with various data states
- **Validation Testing**: Form validation rules and error scenarios
- **Service Integration**: Profile creation and update operations

### Integration Tests

- **Complete Flow**: End-to-end onboarding completion
- **Skip Functionality**: Partial completion and skip scenarios
- **Error Recovery**: Network failures and retry mechanisms
- **Mobile Experience**: Touch interactions and responsive behavior

### Test Files Structure

```
src/features/auth/components/__tests__/
├── OnboardingWizard.test.tsx
├── onboarding/
│   ├── WelcomeStep.test.tsx
│   ├── GenreSelectionStep.test.tsx
│   ├── ProfileSetupStep.test.tsx
│   └── AvatarUploadStep.test.tsx
└── hooks/
    └── useOnboarding.test.ts
```

## Visual Design Implementation

## Figma Design

Use this node in Figma for reference:
https://www.figma.com/design/hbBNyo0TsFdXERRVqU0G79/OTT-Dark-Theme-Website-UI-Design-Template-for-Media-Streaming--Movies-and-TV---FREE-Editable----Community-?node-id=1120-2481&t=ZHeSEk7HqJWVmhXi-4

### Design System Integration

- **Color Palette**: Dark theme with cinematic red (`--primary: #e50914`) and accent
- **Typography**: Inter font family with proper hierarchy
- **Animations**: Smooth transitions between steps, celebration animations
- **Components**: Leverages Shadcn UI components (Button, Card, Input, Progress)

### Mobile-First Responsive Design

- **Breakpoints**: Mobile-first approach with tablet and desktop enhancements
- **Keyboard Support**: Proper tab navigation and keyboard shortcuts
- **Accessibility**: WCAG AA compliance with proper ARIA labels

### Animation Strategy

- **Step Transitions**: Slide animations between steps
- **Progress Updates**: Smooth progress bar animations
- **Completion Celebration**: Popcorn confetti effect on completion
- **Micro-interactions**: Hover states, button feedback, loading states

## Security Considerations

### Data Privacy

- Avatar uploads processed through Supabase Storage with proper access controls
- User data encrypted in transit and at rest
- No sensitive information stored in client-side state

### Input Validation

- Client-side validation for immediate feedback
- Server-side validation for security
- XSS prevention through data sanitization

## Performance Optimization

### Code Splitting

- Dynamic imports for step components

### Image Optimization

- Avatar image compression and resizing
- WebP format support with fallbacks
- Lazy loading for genre icons and images
