# Design Document

## Overview

This design document outlines the comprehensive refactoring approach for cleaning up the MoovyZoo codebase, **specifically focused on the Habitats feature**. The design focuses on eliminating code duplication within the Habitats feature, centralizing common utilities used by Habitats, improving file organization, and establishing better architectural patterns while maintaining all existing functionality. The refactoring will be implemented incrementally to minimize risk and ensure continuous functionality.

**Scope**: This refactoring is limited to the Habitats feature (`src/features/habitats/`) and the shared utilities that it uses. Other features will not be modified as part of this cleanup effort.

## Architecture

### Current State Analysis

The current Habitats feature has several areas that need improvement:

- Duplicated validation logic across Habitats components and services
- Scattered access control logic in multiple Habitats service methods
- Similar hook patterns with repeated code (`useHabitatMessages`, `useDiscussionMessages`, `useRealtimeChat`)
- Complex service methods in `habitats.service.ts` handling multiple concerns
- Inconsistent file naming and organization within the Habitats feature
- Missing transaction support for multi-step Habitat operations
- Tight coupling between Habitat components and external dependencies (router, etc.)

### Target Architecture

The refactored Habitats feature architecture will follow these principles:

- **Single Responsibility**: Each Habitats module, service, and utility has one clear purpose
- **Centralized Utilities**: Common functionality used by Habitats is extracted to shared utilities
- **Loose Coupling**: Habitat components receive dependencies through props or dependency injection
- **Consistent Patterns**: Similar Habitats functionality follows the same implementation patterns
- **Performance Optimization**: React Query for Habitats data management and optimized database queries

## Components and Interfaces

### 1. Centralized Validation System

#### File Structure

```
src/utils/
├── validation.ts           # Core validation utilities
├── sanitization.ts         # Input sanitization functions
└── schema-helpers.ts       # Shared Zod schema utilities
```

#### Core Interfaces

```typescript
// validation.ts
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

export interface UUIDValidationOptions {
  allowNil?: boolean;
  version?: number;
}

// Main validation functions
export function isValidUUID(
  id: string,
  options?: UUIDValidationOptions
): boolean;
export function validateEmail(email: string): ValidationResult;
export function validateMessageContent(content: string): ValidationResult;
export function sanitizeUserInput(input: string): string;
```

#### Schema Helpers

```typescript
// schema-helpers.ts
export const commonSchemas = {
  uuid: z.string().uuid(),
  email: z.string().email(),
  messageContent: z.string().min(1).max(1000),
  habitatName: z.string().min(1).max(100),
  // ... other common patterns
};

export function createPaginationSchema(maxLimit = 100) {
  return z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(maxLimit).default(20),
  });
}
```

### 2. Access Control Service

#### File Structure

```
src/services/
├── access-control.service.ts    # Centralized access control
├── permission-types.ts          # Permission type definitions
└── role-definitions.ts          # Role and permission mappings
```

#### Core Interfaces

```typescript
// permission-types.ts
export enum Permission {
  READ_HABITAT = "read:habitat",
  WRITE_HABITAT = "write:habitat",
  MANAGE_HABITAT = "manage:habitat",
  CREATE_DISCUSSION = "create:discussion",
  MODERATE_DISCUSSION = "moderate:discussion",
  // ... other permissions
}

export enum Role {
  MEMBER = "member",
  MODERATOR = "moderator",
  ADMIN = "admin",
  OWNER = "owner",
}

// access-control.service.ts
export interface AccessControlService {
  checkPermission(
    userId: string,
    resource: string,
    permission: Permission
  ): Promise<boolean>;
  getUserRole(userId: string, habitatId: string): Promise<Role | null>;
  hasAnyPermission(
    userId: string,
    resource: string,
    permissions: Permission[]
  ): Promise<boolean>;
  validateAccess(
    userId: string,
    resource: string,
    permission: Permission
  ): Promise<void>;
}
```

### 3. React Query Integration

#### File Structure

```
src/hooks/
├── queries/
│   ├── use-habitat-queries.ts      # Habitat-related queries
│   ├── use-discussion-queries.ts   # Discussion-related queries
│   ├── use-message-queries.ts      # Message-related queries
│   └── query-keys.ts               # Centralized query key factory
├── mutations/
│   ├── use-habitat-mutations.ts    # Habitat mutations
│   ├── use-discussion-mutations.ts # Discussion mutations
│   └── use-message-mutations.ts    # Message mutations
└── base/
    ├── use-base-query.ts           # Base query hook with common logic
    └── use-base-mutation.ts        # Base mutation hook with error handling
```

#### Query Key Factory

```typescript
// query-keys.ts
export const queryKeys = {
  habitats: {
    all: ["habitats"] as const,
    lists: () => [...queryKeys.habitats.all, "list"] as const,
    list: (filters: string) =>
      [...queryKeys.habitats.lists(), { filters }] as const,
    details: () => [...queryKeys.habitats.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.habitats.details(), id] as const,
    dashboard: (id: string) =>
      [...queryKeys.habitats.detail(id), "dashboard"] as const,
  },
  discussions: {
    all: ["discussions"] as const,
    byHabitat: (habitatId: string) =>
      [...queryKeys.discussions.all, "habitat", habitatId] as const,
    detail: (id: string) =>
      [...queryKeys.discussions.all, "detail", id] as const,
  },
  // ... other query keys
};
```

#### Base Query Hook

```typescript
// use-base-query.ts
export function useBaseQuery<TData, TError = Error>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TData>,
  options?: UseQueryOptions<TData, TError>
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Custom retry logic based on error type
      if (error instanceof AccessDeniedError) return false;
      return failureCount < 3;
    },
    ...options,
  });
}
```

### 4. Simplified Service Architecture

#### Refactored Service Structure

```typescript
// habitats.service.ts - Simplified and focused
export class HabitatsService {
  constructor(
    private repository: HabitatsRepository,
    private accessControl: AccessControlService,
    private validator: ValidationService
  ) {}

  // Focused methods with single responsibilities
  async getHabitat(id: string, userId: string): Promise<Habitat> {
    await this.accessControl.validateAccess(
      userId,
      id,
      Permission.READ_HABITAT
    );
    return this.repository.findById(id);
  }

  async getDashboardData(
    habitatId: string,
    userId: string
  ): Promise<HabitatDashboardData> {
    // Delegate to focused helper methods
    const habitat = await this.getHabitat(habitatId, userId);
    const stats = await this.getHabitatStats(habitatId);
    const recentActivity = await this.getRecentActivity(habitatId);

    return this.buildDashboardData(habitat, stats, recentActivity);
  }

  // Private helper methods for complex operations
  private async getHabitatStats(habitatId: string): Promise<HabitatStats> {
    return this.repository.getStats(habitatId);
  }

  private async getRecentActivity(habitatId: string): Promise<Activity[]> {
    return this.repository.getRecentActivity(habitatId);
  }

  private buildDashboardData(
    habitat: Habitat,
    stats: HabitatStats,
    activity: Activity[]
  ): HabitatDashboardData {
    // Pure data transformation logic
    return {
      habitat,
      stats,
      recentActivity: activity,
      // ... other dashboard data
    };
  }
}
```

### 5. Transaction Support

#### Database Transaction Wrapper

```typescript
// src/utils/database-transaction.ts
export interface TransactionContext {
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export async function withTransaction<T>(
  operation: (ctx: TransactionContext) => Promise<T>
): Promise<T> {
  const client = await supabase.rpc('begin_transaction');

  try {
    const result = await operation({
      commit: () => supabase.rpc('commit_transaction'),
      rollback: () => supabase.rpc('rollback_transaction'),
    });

    await client.commit();
    return result;
  } catch (error) {
    await client.rollback();
    throw error;
  }
}

// Usage in services
async updateHabitatWithMembers(habitatId: string, updates: HabitatUpdate): Promise<void> {
  await withTransaction(async (tx) => {
    await this.repository.updateHabitat(habitatId, updates);
    await this.repository.updateMemberCount(habitatId);
    // If either fails, both are rolled back
  });
}
```

### 6. Improved Component Architecture

#### Decoupled Component Pattern

```typescript
// Before: Tightly coupled
function HabitatCard({ habitat }: { habitat: Habitat }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/habitats/${habitat.id}`);
  };

  return <Card onClick={handleClick}>...</Card>;
}

// After: Loosely coupled
interface HabitatCardProps {
  habitat: Habitat;
  onNavigate?: (habitatId: string) => void;
  onClick?: () => void;
  className?: string;
}

function HabitatCard({
  habitat,
  onNavigate,
  onClick,
  className,
}: HabitatCardProps) {
  const handleClick = () => {
    onClick?.();
    onNavigate?.(habitat.id);
  };

  return (
    <Card onClick={handleClick} className={className}>
      ...
    </Card>
  );
}
```

## Data Models

### Enhanced Error Handling Models

```typescript
// src/types/errors.ts
export interface ServiceError {
  code: AppErrorCode;
  message: string;
  details?: Record<string, any>;
  cause?: Error;
}

export interface TransactionError extends ServiceError {
  rollbackSuccessful: boolean;
  partialOperations: string[];
}

export interface ValidationError extends ServiceError {
  field?: string;
  validationRules: string[];
}
```

### Query and Mutation Models

```typescript
// src/types/queries.ts
export interface PaginatedQuery {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MutationResult<T> {
  data?: T;
  error?: ServiceError;
  success: boolean;
}
```

## Error Handling

### Centralized Error Processing

```typescript
// src/utils/error-processor.ts
export class ErrorProcessor {
  static processServiceError(error: unknown): ServiceError {
    if (error instanceof ServiceError) return error;

    if (error instanceof PostgrestError) {
      return this.processSupabaseError(error);
    }

    if (error instanceof ZodError) {
      return this.processValidationError(error);
    }

    return {
      code: AppErrorCode.UNKNOWN_ERROR,
      message: "An unexpected error occurred",
      cause: error instanceof Error ? error : new Error(String(error)),
    };
  }

  static processSupabaseError(error: PostgrestError): ServiceError {
    // Map Supabase errors to application errors
    const errorMap: Record<string, AppErrorCode> = {
      "23505": AppErrorCode.DUPLICATE_ENTRY,
      "23503": AppErrorCode.FOREIGN_KEY_VIOLATION,
      "42501": AppErrorCode.ACCESS_DENIED,
      // ... other mappings
    };

    const code = errorMap[error.code] || AppErrorCode.DATABASE_ERROR;
    return {
      code,
      message: errorMap[code]?.message || "Database operation failed",
      details: { originalError: error.message },
      cause: error,
    };
  }
}
```

### React Query Error Handling

```typescript
// src/hooks/base/use-base-mutation.ts
export function useBaseMutation<TData, TVariables>(
  mutationFn: MutationFunction<TData, TVariables>,
  options?: UseMutationOptions<TData, ServiceError, TVariables>
) {
  return useMutation({
    mutationFn,
    onError: (error) => {
      const processedError = ErrorProcessor.processServiceError(error);

      // Log error for debugging
      console.error("Mutation error:", processedError);

      // Show user-friendly error message
      toast.error(processedError.message);

      // Call custom error handler if provided
      options?.onError?.(processedError);
    },
    ...options,
  });
}
```

## Testing Strategy

### Unit Testing Approach

1. **Utility Functions**: Test all validation, sanitization, and helper functions with comprehensive edge cases
2. **Service Methods**: Test business logic with mocked dependencies and error scenarios
3. **Hooks**: Test React Query hooks with mock data and error states
4. **Components**: Test component behavior with different prop combinations

### Integration Testing

1. **Service Integration**: Test services with real database connections in test environment
2. **Hook Integration**: Test hooks with actual React Query client
3. **Component Integration**: Test component interactions with real data flow

### Migration Testing

1. **Backward Compatibility**: Ensure all existing functionality works after refactoring
2. **Performance Testing**: Verify that optimizations improve performance metrics
3. **Error Handling**: Test that new error handling provides better user experience

## Implementation Phases

### Phase 1: Foundation (High Priority)

1. Create centralized validation utilities
2. Implement access control service
3. Set up React Query infrastructure
4. Create base hooks and query patterns

### Phase 2: Service Refactoring (High Priority)

1. Simplify complex service methods
2. Implement transaction support
3. Optimize database queries
4. Standardize error handling

### Phase 3: Component Improvements (Medium Priority)

1. Decouple components from external dependencies
2. Improve component reusability
3. Update component interfaces
4. Add comprehensive testing

### Phase 4: Performance Optimization (Medium Priority)

1. Implement React Query caching strategies
2. Optimize database query performance
3. Add performance monitoring
4. Implement lazy loading where appropriate

### Phase 5: Documentation and Cleanup (Low Priority)

1. Update documentation for new patterns
2. Remove deprecated code
3. Standardize file naming conventions
4. Add comprehensive code comments

This design provides a clear roadmap for systematically improving the codebase while maintaining functionality and establishing better architectural patterns for future development.
