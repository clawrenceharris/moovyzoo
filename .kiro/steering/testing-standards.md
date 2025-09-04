# Testing Standards - Zoovie

## Issue Resolution: Vitest Configuration

### Problem

The vitest configuration was set up primarily for Storybook tests with a missing setup file, preventing unit tests from running properly.

### Root Cause

- `vitest.config.ts` referenced a non-existent setup file (`./src/test/setup.ts`)
- Configuration only included Storybook browser tests in projects
- Unit tests had no proper test environment configuration

### Solution

#### 1. Create Missing Test Setup File

Create `src/test/setup.ts`:

```typescript
import "@testing-library/jest-dom";
import { beforeAll, afterEach, afterAll } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Optional: Setup global test environment
beforeAll(() => {
  // Global setup if needed
});

afterAll(() => {
  // Global cleanup if needed
});
```

#### 2. Fix Vitest Configuration

Update `vitest.config.ts` to support both unit tests and Storybook tests:

```typescript
/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    // Support both unit tests and Storybook tests
    projects: [
      // Unit tests project
      {
        name: "unit",
        test: {
          include: ["src/**/*.{test,spec}.{ts,tsx}"],
          environment: "jsdom",
          setupFiles: ["./src/test/setup.ts"],
        },
      },
      // Storybook tests project
      {
        name: "storybook",
        plugins: [
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
          include: ["src/**/*.stories.{ts,tsx}"],
        },
      },
    ],
  },
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

#### 3. Update Package.json Scripts

Ensure scripts can run different test types:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:unit": "vitest run --project unit",
    "test:storybook": "vitest run --project storybook",
    "test:watch": "vitest --project unit"
  }
}
```

## Testing Architecture

### Unit Tests

- **Location**: `src/**/__tests__/*.test.{ts,tsx}`
- **Environment**: jsdom
- **Purpose**: Test component logic, hooks, and utilities
- **Tools**: Vitest + Testing Library

### Storybook Tests

- **Location**: `src/**/*.stories.{ts,tsx}`
- **Environment**: Browser (Playwright)
- **Purpose**: Visual regression and interaction testing
- **Tools**: Storybook + Vitest addon

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

### Test-Driven Development (TDD) - MANDATORY

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
