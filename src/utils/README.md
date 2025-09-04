# Foundation Utilities

This directory contains centralized utilities for the Habitats feature, providing consistent validation, error handling, and data processing across the application.

## Overview

The foundation utilities are designed to:

- Eliminate code duplication across the Habitats feature
- Provide consistent validation and error handling
- Establish reusable patterns for common operations
- Improve maintainability and testability

## Utilities

### Validation (`validation.ts`)

Centralized validation functions for common data types used in the Habitats feature.

```typescript
import {
  isValidUUID,
  validateEmail,
  validateMessageContent,
} from "@/utils/validation";

// UUID validation
const isValid = isValidUUID("123e4567-e89b-12d3-a456-426614174000"); // true

// Email validation
const emailResult = validateEmail("user@example.com");
// { isValid: true }

// Message content validation
const messageResult = validateMessageContent("Hello world!");
// { isValid: true }
```

**Functions:**

- `isValidUUID(id, options?)` - Validates UUID format
- `validateEmail(email)` - Validates email format
- `validateMessageContent(content)` - Validates message content for discussions
- `validateHabitatName(name)` - Validates habitat names
- `validateDiscussionTitle(title)` - Validates discussion titles

### Sanitization (`sanitization.ts`)

Input sanitization functions to prevent XSS and ensure data integrity.

```typescript
import {
  sanitizeUserInput,
  sanitizeMessageContent,
} from "@/utils/sanitization";

// General input sanitization
const clean = sanitizeUserInput("  Hello\x00World  "); // 'Hello World'

// Message content sanitization (preserves newlines)
const cleanMessage = sanitizeMessageContent("Line 1\n\nLine 2\n\n\n\nLine 3");
// 'Line 1\n\nLine 2\n\nLine 3'
```

**Functions:**

- `sanitizeUserInput(input)` - General input sanitization
- `sanitizeMessageContent(content)` - Message-specific sanitization
- `sanitizeTitle(title)` - Title sanitization (removes newlines)
- `sanitizeSearchQuery(query)` - Search query sanitization
- `sanitizeUrl(url)` - URL sanitization (allows only HTTP/HTTPS)

### Schema Helpers (`schema-helpers.ts`)

Reusable Zod schema patterns and factories for consistent validation.

```typescript
import { commonSchemas, createPaginationSchema } from "@/utils/schema-helpers";

// Use common schemas
const messageSchema = z.object({
  content: commonSchemas.messageContent,
  habitatId: commonSchemas.uuid,
});

// Create pagination schema
const paginationSchema = createPaginationSchema(50); // max 50 items
```

**Common Schemas:**

- `uuid` - UUID validation
- `email` - Email validation
- `messageContent` - Message content validation
- `habitatName` - Habitat name validation
- `discussionTitle` - Discussion title validation
- `description` - Optional description validation

**Schema Factories:**

- `createPaginationSchema(maxLimit?)` - Pagination parameters
- `createSearchSchema(minLength?, maxLength?)` - Search parameters
- `createMemberSchema()` - Habitat member operations
- `createTimeBasedSchema()` - Time-based operations
- `createMediaSchema()` - Media-related operations

### Error Handling

#### Error Codes (`error-codes.ts`)

Standardized error codes for consistent error handling across the application.

```typescript
import { AppErrorCode } from "@/utils/error-codes";

// Use standardized error codes
throw new Error(AppErrorCode.HABITAT_NOT_FOUND);
```

#### Error Map (`error-map.ts`)

User-friendly error messages with Zoovie's brand voice.

```typescript
import { getErrorMessage } from "@/utils/error-map";

const errorMessage = getErrorMessage(AppErrorCode.VALIDATION_ERROR);
// { title: 'Invalid Input', message: 'Some information needs fixing...' }
```

#### Error Normalization (`normalize-error.ts`)

Converts various error types to standardized format.

```typescript
import { normalizeError } from "@/utils/normalize-error";

try {
  // Some operation that might fail
} catch (error) {
  const normalized = normalizeError(error);
  console.log(normalized.code); // AppErrorCode
  console.log(normalized.message); // User-friendly message
}
```

**Functions:**

- `normalizeError(error)` - Converts any error to NormalizedError
- `createNormalizedError(code, originalError?, details?)` - Creates normalized error
- `isRetryableError(error)` - Checks if error is retryable
- `isUserFacingError(error)` - Checks if error should be shown to user
- `getUserErrorMessage(error)` - Gets user-friendly error message

## React Query Integration

### Query Keys (`/hooks/queries/query-keys.ts`)

Centralized query key factory for consistent caching.

```typescript
import { queryKeys } from "@/hooks/queries/query-keys";

// Use hierarchical query keys
const habitatKey = queryKeys.habitats.detail("habitat-123");
const dashboardKey = queryKeys.habitats.dashboard("habitat-123");
```

### Base Hooks (`/hooks/base/`)

Base query and mutation hooks with consistent error handling and caching.

```typescript
import { useBaseQuery, useBaseMutation } from "@/hooks/base";

// Base query with error handling
const { data, error, isLoading } = useBaseQuery(
  queryKeys.habitats.detail(id),
  () => habitatsService.getHabitat(id)
);

// Base mutation with cache invalidation
const createMutation = useBaseMutation(habitatsService.createHabitat, {
  invalidateQueries: [queryKeys.habitats.all],
  successMessage: "Habitat created successfully!",
});
```

## Usage in Habitats Feature

The Habitats schema (`src/features/habitats/domain/habitats.schema.ts`) has been updated to use these centralized utilities:

```typescript
// Before: Duplicated validation logic
export const messageContentSchema = z
  .string()
  .trim()
  .min(1, "Message content cannot be empty")
  .max(1000, "Message is too long");

// After: Using centralized schema
export const messageContentSchema = commonSchemas.messageContent;
```

## Testing

All utilities include comprehensive unit tests:

```bash
# Run validation tests
npm test src/utils/__tests__/validation.test.ts

# Run sanitization tests
npm test src/utils/__tests__/sanitization.test.ts

# Run error handling tests
npm test src/utils/__tests__/normalize-error.test.ts

# Run query key tests
npm test src/hooks/queries/__tests__/query-keys.test.ts
```

## Benefits

1. **Consistency** - All validation and error handling follows the same patterns
2. **Maintainability** - Changes to validation rules only need to be made in one place
3. **Testability** - Utilities are pure functions that are easy to test
4. **Performance** - React Query provides efficient caching and background updates
5. **Developer Experience** - Clear error messages and consistent APIs

## Next Steps

These foundation utilities enable the implementation of:

- Centralized access control service
- Optimized React Query hooks for Habitats
- Simplified service methods
- Better component decoupling
- Enhanced error handling throughout the application
