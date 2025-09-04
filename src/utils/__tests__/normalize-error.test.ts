/**
 * Unit tests for error normalization utilities
 */

import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import {
  normalizeError,
  createNormalizedError,
  isRetryableError,
  isUserFacingError,
  getUserErrorMessage,
} from "../normalize-error";
import { AppErrorCode } from "../error-codes";

describe("normalizeError", () => {
  it("should handle standard Error objects", () => {
    const error = new Error("Test error");
    const normalized = normalizeError(error);

    expect(normalized.code).toBe(AppErrorCode.UNKNOWN_ERROR);
    expect(normalized.originalError).toBe(error);
  });

  it("should handle string errors", () => {
    const error = "String error message";
    const normalized = normalizeError(error);

    expect(normalized.code).toBe(AppErrorCode.UNKNOWN_ERROR);
    expect(normalized.message).toBeDefined();
  });

  it("should handle Supabase-like errors", () => {
    const error = {
      code: "23505",
      message: "duplicate key value violates unique constraint",
      status: 409,
    };
    const normalized = normalizeError(error);

    expect(normalized.code).toBe(AppErrorCode.DUPLICATE_ENTRY);
    expect(normalized.originalError).toBe(error);
  });

  it("should handle network errors", () => {
    const error = new TypeError("Failed to fetch");
    const normalized = normalizeError(error);

    expect(normalized.code).toBe(AppErrorCode.NETWORK_ERROR);
    expect(normalized.originalError).toBe(error);
  });

  it("should handle already normalized errors", () => {
    const originalError = createNormalizedError(AppErrorCode.ACCESS_DENIED);
    const normalized = normalizeError(originalError);

    expect(normalized).toBe(originalError);
    expect(normalized.code).toBe(AppErrorCode.ACCESS_DENIED);
  });
});

describe("createNormalizedError", () => {
  it("should create a normalized error with correct properties", () => {
    const code = AppErrorCode.VALIDATION_ERROR;
    const originalError = new Error("Original error");
    const details = { field: "email" };

    const normalized = createNormalizedError(code, originalError, details);

    expect(normalized.code).toBe(code);
    expect(normalized.originalError).toBe(originalError);
    expect(normalized.details).toBe(details);
    expect(normalized.name).toBe("NormalizedError");
  });
});

describe("isRetryableError", () => {
  it("should identify retryable errors", () => {
    const retryableError = createNormalizedError(AppErrorCode.NETWORK_ERROR);
    const nonRetryableError = createNormalizedError(
      AppErrorCode.VALIDATION_ERROR
    );

    expect(isRetryableError(retryableError)).toBe(true);
    expect(isRetryableError(nonRetryableError)).toBe(false);
  });
});

describe("isUserFacingError", () => {
  it("should identify user-facing errors", () => {
    const userFacingError = createNormalizedError(
      AppErrorCode.VALIDATION_ERROR
    );
    const internalError = createNormalizedError(AppErrorCode.DATABASE_ERROR);

    expect(isUserFacingError(userFacingError)).toBe(true);
    expect(isUserFacingError(internalError)).toBe(false);
  });
});

describe("getUserErrorMessage", () => {
  it("should return appropriate messages for different error types", () => {
    const userFacingError = createNormalizedError(
      AppErrorCode.VALIDATION_ERROR
    );
    const internalError = createNormalizedError(AppErrorCode.DATABASE_ERROR);

    const userMessage = getUserErrorMessage(userFacingError);
    const internalMessage = getUserErrorMessage(internalError);

    expect(userMessage).toContain("information needs fixing");
    expect(internalMessage).toContain("unexpected happened");
  });
});
