# Implementation Plan

- [x] 1. Set up foundation utilities and React Query infrastructure

  - Create centralized validation utilities for Habitats feature
  - Set up React Query configuration and base hooks
  - Create query key factory for Habitats-related queries
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.5, 3.6, 3.7, 3.8_

- [x] 2. Create centralized validation utilities
- [x] 2.1 Create core validation utility functions

  - Write `src/utils/validation.ts` with UUID validation, email validation, and message content validation
  - Write `src/utils/sanitization.ts` with input sanitization functions
  - Create unit tests for all validation functions
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2.2 Create shared Zod schema helpers

  - Write `src/utils/schema-helpers.ts` with common schema patterns used by Habitats
  - Create reusable schema factories for pagination, UUID validation, and content validation
  - Write unit tests for schema helper functions
  - _Requirements: 1.3, 1.5_

- [x] 2.3 Update Habitats schemas to use centralized utilities

  - Refactor `src/features/habitats/domain/habitats.schema.ts` to use shared schema helpers
  - Remove duplicated validation logic from Habitats schemas
  - Ensure all existing validation behavior is preserved
  - _Requirements: 1.1, 1.5_

- [x] 3. Implement access control service
- [x] 3.1 Create access control service foundation

  - Write `src/services/permission-types.ts` with Permission and Role enums
  - Write `src/services/role-definitions.ts` with role-permission mappings
  - Create TypeScript interfaces for access control operations
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3.2 Implement AccessControlService class

  - Write `src/services/access-control.service.ts` with centralized permission checking
  - Implement methods for checking habitat permissions, user roles, and access validation
  - Create unit tests for access control service methods
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3.3 Refactor Habitats service to use AccessControlService

  - Update `src/features/habitats/domain/habitats.service.ts` to use centralized access control
  - Remove scattered access control logic from individual service methods
  - Ensure all existing access control behavior is preserved
  - _Requirements: 2.4, 2.5_

- [x] 4. Set up React Query infrastructure for Habitats
- [x] 4.1 Create query key factory and base hooks

  - Write `src/hooks/queries/query-keys.ts` with centralized query key factory for Habitats
  - Write `src/hooks/base/use-base-query.ts` with common query logic and error handling
  - Write `src/hooks/base/use-base-mutation.ts` with common mutation logic and error handling
  - _Requirements: 3.5, 3.6, 3.7, 3.8_

- [x] 4.2 Create Habitat-specific query hooks

  - Write `src/hooks/queries/use-habitat-queries.ts` with useHabitat, useHabitats, and useHabitatDashboard hooks
  - Replace existing useState-based data fetching in Habitat components with React Query hooks
  - Implement proper caching, background refetching, and error handling
  - _Requirements: 3.6, 3.7, 3.8_

- [x] 4.3 Create Discussion-specific query hooks

  - Write `src/hooks/queries/use-discussion-queries.ts` with useDiscussions and useDiscussion hooks
  - Replace existing data fetching in Discussion components with React Query hooks
  - Implement optimistic updates for discussion operations
  - _Requirements: 3.6, 3.7, 3.8_

- [x] 4.4 Create mutation hooks for Habitats operations

  - Write `src/hooks/mutations/use-habitat-mutations.ts` with create, update, and delete habitat mutations
  - Write `src/hooks/mutations/use-discussion-mutations.ts` with discussion-related mutations
  - Implement proper error handling and cache invalidation strategies
  - _Requirements: 3.5, 3.7, 3.8_

- [x] 5. Consolidate and optimize hook patterns
- [x] 5.1 Create base message hook with shared functionality

  - Write `src/hooks/base/use-base-messages.ts` with common message handling logic
  - Extract shared functionality from `useHabitatMessages` and `useDiscussionMessages`
  - Implement consistent loading states, error handling, and real-time updates
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5.2 Refactor existing message hooks to use base hook

  - Update `src/features/habitats/hooks/useHabitatMessages.ts` to extend base message hook
  - Update `src/features/habitats/hooks/useDiscussionMessages.ts` to extend base message hook
  - Remove duplicated code while preserving all existing functionality
  - _Requirements: 3.1, 3.4_

- [x] 5.3 Optimize real-time connection management

  - Refactor `src/features/habitats/hooks/useRealtimeChat.ts` to use shared connection logic
  - Extract common real-time connection patterns to base hook
  - Implement better connection state management and error recovery
  - _Requirements: 3.2, 3.3_

- [x] 6. Simplify complex service methods
- [x] 6.1 Break down large service methods into focused functions

  - Refactor `getDashboardData` method in `habitats.service.ts` into smaller, focused helper methods
  - Extract data fetching, access control, and data transformation into separate functions
  - Create private helper methods with single responsibilities
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6.2 Implement service method composition patterns

  - Create focused methods for habitat stats, recent activity, and member management
  - Implement pure data transformation functions separate from data fetching
  - Use dependency injection for better testability and maintainability
  - _Requirements: 4.1, 4.3, 4.4_

- [x] 6.3 Add comprehensive error handling to service methods

  - Implement consistent error processing using centralized error handling utilities
  - Add proper logging and error context for debugging
  - Ensure all service methods return consistent error formats
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 7. Implement transaction support for multi-step operations
- [x] 7.1 Create database transaction wrapper utility

  - Write `src/utils/database-transaction.ts` with transaction management functions
  - Implement proper commit and rollback mechanisms for Supabase operations
  - Create unit tests for transaction wrapper functionality
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 7.2 Update Habitats service to use transactions

  - Refactor multi-step operations in `habitats.service.ts` to use transaction wrapper
  - Implement proper rollback for operations like habitat creation with member updates
  - Add transaction error handling and logging
  - _Requirements: 6.1, 6.3, 6.4, 6.5_

- [ ] 8. Optimize database query performance
- [x] 8.1 Review and optimize Habitats repository queries

  - Analyze `src/features/habitats/data/habitats.repository.ts` for N+1 query patterns
  - Optimize discussion and message queries using proper joins and aggregations
  - Implement efficient pagination for large datasets
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 8.2 Implement query optimization strategies

  - Add database-level aggregations for statistics and counts
  - Consider using database views for complex queries
  - Implement proper indexing strategies for frequently accessed data
  - _Requirements: 9.1, 9.2, 9.4, 9.5_

- [ ] 9. Decouple Habitat components from external dependencies
- [ ] 9.1 Refactor components to accept navigation handlers as props

  - Update `HabitatCard`, `DiscussionCard`, and other components to accept `onNavigate` props
  - Remove direct router usage from component implementations
  - Update parent components to pass navigation handlers
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 9.2 Implement dependency injection patterns for components

  - Refactor components to receive data through props rather than fetching internally
  - Update components to use React Query hooks passed from parent components
  - Improve component reusability and testability
  - Avoid prop drilling and maintain component statelessness
  - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [ ] 9.3 Update component interfaces for better reusability

  - Standardize prop interfaces across similar components
  - Add proper TypeScript interfaces with optional props for customization
  - Ensure components work correctly in different contexts
  - _Requirements: 7.1, 7.4, 7.5_

- [ ] 10. Improve file organization and naming consistency
- [ ] 10.1 Standardize file naming conventions

  - Rename service files to use kebab-case (e.g., `access-control.service.ts`)
  - Organize utility files by functionality with consistent naming
  - Update import statements throughout the Habitats feature
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 10.2 Reorganize shared utilities and services

  - Move shared utilities to appropriate directories with clear organization
  - Create proper barrel exports for clean import paths
  - Update all import statements to use new file locations
  - _Requirements: 5.2, 5.3, 5.5_

- [ ] 11. Add comprehensive testing for refactored code
- [ ] 11.1 Create unit tests for new utilities and services

  - Write comprehensive tests for validation utilities with edge cases
  - Create tests for access control service with various permission scenarios
  - Add tests for React Query hooks with mock data and error states
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 11.2 Create integration tests for refactored components

  - Test component interactions with new React Query hooks
  - Verify that refactored components maintain existing functionality
  - Add tests for error handling and loading states
  - _Requirements: 10.1, 10.3, 10.5_

- [ ] 11.3 Verify backward compatibility and performance

  - Run existing test suite to ensure no regressions
  - Perform performance testing to verify optimizations
  - Test error handling improvements with various failure scenarios
  - _Requirements: 10.1, 10.2, 10.4, 10.5_

- [ ] 12. Update documentation and clean up deprecated code
- [ ] 12.1 Update code documentation for new patterns

  - Add JSDoc comments to new utility functions and services
  - Document React Query usage patterns and caching strategies
  - Create migration notes for developers working on Habitats feature
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 12.2 Remove deprecated code and update imports
  - Remove old validation logic that has been centralized
  - Clean up unused imports and dead code
  - Update all import statements to use new centralized utilities
  - _Requirements: 10.1, 10.4, 10.5_
