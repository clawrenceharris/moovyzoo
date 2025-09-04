import { beforeAll, afterEach, afterAll } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

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
