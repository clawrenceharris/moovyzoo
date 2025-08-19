# Implementation Plan

## Phase 1: Core Structure & Layout

- [x] 1. Enhance existing onboarding hook and types

  - Update OnboardingStep enum to include all required steps (welcome, genre_selection, profile_setup, avatar_upload)
  - Add quote field to OnboardingData interface
  - Add basic step navigation helpers (nextStep, previousStep, goToStep)
  - _Requirements: 1.1, 4.1, 4.2_

- [ ] 2. Create basic onboarding wizard container structure

  - Implement OnboardingWizard.tsx with basic HTML structure and layout
  - Add step routing logic using conditional rendering via a switch statement
  - Create basic progress indicators (no numbers just one bar for each step)
  - Add navigation buttons (Next, Back, Skip) with basic styling
  - _Requirements: 1.1, 1.3, 4.1_

- [ ] 3. Build welcome step HTML structure

  - Create WelcomeStep.tsx with semantic HTML structure
  - Add heading, description text, and continue button
  - Include basic responsive layout without animations
  - _Requirements: 1.2_

- [ ] 4. Create genre selection step layout

  - Implement GenreSelectionStep.tsx with grid layout structure
  - Create GenreCard.tsx component with basic card HTML
  - Add checkbox/selection input elements
  - Build responsive grid layout for genre cards
  - _Requirements: 2.1, 2.2_

- [ ] 5. Build profile setup step form structure

  - Create ProfileSetupStep.tsx with form HTML structure
  - Add input fields for display name and quote Input field
  - Include form labels and basic validation markup
  - Structure form layout with proper semantic HTML
  - _Requirements: 3.1, 3.2_

- [ ] 6. Create avatar upload step layout

  - Implement AvatarUploadStep.tsx with file upload HTML structure
  - Add file input, preview area, and upload button elements
  - Create basic layout for image preview and controls
  - _Requirements: 3.3_

- [ ] 7. Build completion step structure
  - Create CompletionStep.tsx with success message layout
  - Add summary section for displaying user selections
  - Include final action button to complete onboarding
  - _Requirements: 4.4_

## Phase 2: Logic & Functionality

- [ ] 8. Integrate onboarding wizard with signup flow

  - Add onboarding route and page component
  - Modify signup page to redirect to onboarding after successful registration
  - Handle authentication state and user session management
  - _Requirements: 1.1, 1.3_

- [ ] 9. Implement step navigation and validation logic

  - Add validation logic in useOnboarding hook for each step
  - Implement step progression with validation checks
  - Add form validation for display name and genre selection
  - Handle step completion and data persistence
  - _Requirements: 2.3, 3.2, 4.2, 4.3_

- [ ] 10. Add genre selection functionality

  - Implement multi-select logic for genre cards using RHF
  - Integrate with existing Genre interface and mock data
  - Handle selection state management
  - _Requirements: 2.2, 2.3, 2.4_

- [ ] 11. Implement profile setup form logic

  - Add form validation using existing validation patterns, integrated with RHF
  - Integrate with FormLayout component for consistency
  - Handle real-time validation feedback
  - Connect to profile data updates
  - _Requirements: 3.1, 3.2, 3.4_

- [ ] 12. Add avatar upload functionality

  - Implement file upload logic with validation (file type, size)
  - Add image preview functionality
  - Integrate with Supabase Storage for image uploads
  - Handle upload errors and retry mechanisms
  - _Requirements: 3.3, 3.4_

- [ ] 13. Implement skip functionality and data persistence

  - Add skip buttons with confirmation logic
  - Handle partial onboarding completion and data saving
  - Implement profile creation with collected data
  - Add logic to prompt incomplete users on subsequent logins
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 14. Add error handling and user feedback
  - Integrate with existing error normalization and errorMap system
  - Add proper error boundaries for onboarding components
  - Implement loading states during async operations
  - Add retry mechanisms for failed operations
  - _Requirements: 3.4, 6.1_

## Phase 3: Mobile & Responsive Design

- [ ] 15. Implement mobile responsiveness

  - Ensure all components work on mobile devices with proper layouts
  - Test and fix responsive layouts across different screen sizes
  - Add proper keyboard navigation support
  - _Requirements: 7.1, 7.2, 7.4_

- [ ] 16. Add mobile-specific features
  - Support camera/gallery selection for avatar upload on mobile
  - Optimize form inputs for mobile keyboards
  - _Requirements: 7.3_

## Phase 4: Visual Polish & Animations

- [ ] 17. Apply cinematic visual design system

  - Add dark theme styling with cinematic red accents
  - Apply proper typography using Inter font family
  - Implement component styling using Tailwind v4 tokens
  - Add proper spacing, colors, and visual hierarchy
  - _Requirements: 6.1, 6.3_

- [ ] 18. Add smooth animations and transitions

  - Implement step transition animations
  - Add progress bar animations and visual feedback
  - Create hover states and micro-interactions for genre cards
  - Add loading animations and state transitions
  - _Requirements: 6.2, 6.4_

- [ ] 19. Create celebration and completion animations
  - Add celebration animation for completion step
  - Implement success feedback animations
  - Add visual feedback for form submissions and validations
  - Polish all interactive elements with smooth animations
  - _Requirements: 6.4_

## Phase 5: Testing & Final Integration

- [ ] 20. Create comprehensive test suite

  - Write unit tests for useOnboarding hook state management
  - Add component tests for each onboarding step
  - Create integration tests for complete onboarding flow
  - Test error scenarios, validation, and edge cases
  - _Requirements: All requirements validation_

- [ ] 21. Final integration and end-to-end testing
  - Test complete signup-to-onboarding-to-main-app flow
  - Verify data persistence and profile creation
  - Test skip scenarios and incomplete profile handling
  - Validate mobile experience and responsive behavior
  - Ensure proper error handling and recovery mechanisms
  - _Requirements: All requirements integration_
