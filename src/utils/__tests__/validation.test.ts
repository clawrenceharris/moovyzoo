/**
 * Unit tests for validation utilities
 */

import { describe, it, expect } from "vitest";
import {
  isValidUUID,
  validateEmail,
  validateMessageContent,
  validateHabitatName,
  validateDiscussionTitle,
} from "../validation";

describe("validation utilities", () => {
  describe("isValidUUID", () => {
    it("should validate correct UUID v4 format", () => {
      const validUUIDs = [
        "123e4567-e89b-12d3-a456-426614174000",
        "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      ];

      validUUIDs.forEach((uuid) => {
        expect(isValidUUID(uuid)).toBe(true);
      });
    });

    it("should reject invalid UUID formats", () => {
      const invalidUUIDs = [
        "",
        "not-a-uuid",
        "123e4567-e89b-12d3-a456", // too short
        "123e4567-e89b-12d3-a456-426614174000-extra", // too long
        "123e4567_e89b_12d3_a456_426614174000", // wrong separators
        "gggggggg-gggg-gggg-gggg-gggggggggggg", // invalid characters
      ];

      invalidUUIDs.forEach((uuid) => {
        expect(isValidUUID(uuid)).toBe(false);
      });
    });

    it("should handle allowNil option", () => {
      expect(isValidUUID("", { allowNil: true })).toBe(true);
      expect(isValidUUID("", { allowNil: false })).toBe(false);
      expect(isValidUUID("")).toBe(false); // default is false
    });
  });

  describe("validateEmail", () => {
    it("should validate correct email formats", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.org",
        "user123@test-domain.com",
      ];

      validEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.errors).toBeUndefined();
      });
    });

    it("should reject invalid email formats", () => {
      const invalidEmails = [
        "",
        "not-an-email",
        "@domain.com",
        "user@",
        "user@domain",
        "user.domain.com",
        "user @domain.com", // space
      ];

      invalidEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.errors).toBeDefined();
        expect(result.errors!.length).toBeGreaterThan(0);
      });
    });

    it("should handle empty email", () => {
      const result = validateEmail("");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Email is required");
    });
  });

  describe("validateMessageContent", () => {
    it("should validate correct message content", () => {
      const validMessages = [
        "Hello world!",
        "This is a valid message with some content.",
        "A".repeat(1000), // exactly 1000 characters
      ];

      validMessages.forEach((message) => {
        const result = validateMessageContent(message);
        expect(result.isValid).toBe(true);
        expect(result.errors).toBeUndefined();
      });
    });

    it("should reject empty or whitespace-only messages", () => {
      const emptyMessages = ["", "   ", "\t\n  "];

      emptyMessages.forEach((message) => {
        const result = validateMessageContent(message);
        expect(result.isValid).toBe(false);
        expect(result.errors).toBeDefined();
      });
    });

    it("should reject messages that are too long", () => {
      const longMessage = "A".repeat(1001); // 1001 characters
      const result = validateMessageContent(longMessage);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Message content must be 1000 characters or less"
      );
    });
  });

  describe("validateHabitatName", () => {
    it("should validate correct habitat names", () => {
      const validNames = [
        "Movie Lovers",
        "Sci-Fi Fans",
        "A".repeat(100), // exactly 100 characters
      ];

      validNames.forEach((name) => {
        const result = validateHabitatName(name);
        expect(result.isValid).toBe(true);
        expect(result.errors).toBeUndefined();
      });
    });

    it("should reject empty or whitespace-only names", () => {
      const emptyNames = ["", "   ", "\t\n  "];

      emptyNames.forEach((name) => {
        const result = validateHabitatName(name);
        expect(result.isValid).toBe(false);
        expect(result.errors).toBeDefined();
      });
    });

    it("should reject names that are too long", () => {
      const longName = "A".repeat(101); // 101 characters
      const result = validateHabitatName(longName);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Habitat name must be 100 characters or less"
      );
    });
  });

  describe("validateDiscussionTitle", () => {
    it("should validate correct discussion titles", () => {
      const validTitles = [
        "Great Movie Discussion",
        "What did you think about the ending?",
        "A".repeat(200), // exactly 200 characters
      ];

      validTitles.forEach((title) => {
        const result = validateDiscussionTitle(title);
        expect(result.isValid).toBe(true);
        expect(result.errors).toBeUndefined();
      });
    });

    it("should reject titles that are too short", () => {
      const shortTitles = ["", "A", "AB"];

      shortTitles.forEach((title) => {
        const result = validateDiscussionTitle(title);
        expect(result.isValid).toBe(false);
        expect(result.errors).toBeDefined();
      });
    });

    it("should reject titles that are too long", () => {
      const longTitle = "A".repeat(201); // 201 characters
      const result = validateDiscussionTitle(longTitle);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Discussion title must be 200 characters or less"
      );
    });

    it("should require minimum 3 characters", () => {
      const result = validateDiscussionTitle("AB");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Discussion title must be at least 3 characters"
      );
    });
  });
});
