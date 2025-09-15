---
inclusion: always
---

# Testing Standards - MoovyZoo

## Testing Architecture

### Unit Tests

- **Location**: `src/**/__tests__/*.test.{ts,tsx}`
- **Environment**: jsdom
- **Purpose**: Test component logic, hooks, and utilities
- **Tools**: Vitest + Testing Library

### Integration Tests

- **Location**: `src/**/*.integration.test.{ts,tsx}`
- **Environment**: jsdom or browser
- **Purpose**: Test feature workflows and API integration

## Best Practices

### Unit Test Structure

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ComponentName } from "../ComponentName";

describe("ComponentName", () => {
  it("should render with default props", () => {
    render(<ComponentName />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
```

### Test File Organization

```
src/
├── components/
│   ├── states/
│   │   ├── __tests__/
│   │   │   ├── LoadingState.test.tsx
│   │   │   ├── ErrorState.test.tsx
│   │   │   └── EmptyState.test.tsx
│   │   ├── LoadingState.tsx
│   │   ├── LoadingState.stories.tsx
│   │   └── index.ts
```

### Running Tests

```bash
# Run all tests
npm run test

# Run only unit tests
npm run test:unit

# Run only Storybook tests
npm run test:storybook

# Watch mode for unit tests
npm run test:watch
```

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**: Check path aliases in vitest.config.ts
2. **"setupFiles not found"**: Ensure setup file exists at specified path
3. **Tests not running**: Check include/exclude patterns in test config
4. **Browser tests failing**: Ensure Playwright is installed

### Debug Commands

```bash
# Check test discovery
npx vitest list

# Run with verbose output
npx vitest run --reporter=verbose

# Run specific test file
npx vitest run src/components/states/__tests__/LoadingState.test.tsx
```

## Testing Practices

### Important!! Test-Driven Development (TDD) - MANDATORY

**Requirement:** All code must be developed using strict Test-Driven Development practices.

#### TDD Cycle (Red-Green-Refactor)

1. **Red:** Write a failing test that describes the desired behavior
2. **Green:** Write the minimal code to make the test pass
3. **Refactor:** Improve code quality while keeping tests green

#### TDD Implementation Rules

- **No Production Code:** Write no production code without a failing test
- **Minimal Test Code:** Write only enough test code to demonstrate a failure
- **Minimal Production Code:** Write only enough production code to pass the failing test
- **Test First:** Always write tests before implementation code
- **Full Test Suite:** The complete test suite MUST be passing before marking any task as complete

## Things to Avoid:

- Do not run `npm run test:unit` or similar command. This throws an error.
- Instead run `npm run test *` command.
