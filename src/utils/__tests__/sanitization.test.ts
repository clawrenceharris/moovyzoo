/**
 * Unit tests for sanitization utilities
 */

import { describe, it, expect } from "vitest";
import {
  sanitizeUserInput,
  sanitizeMessageContent,
  sanitizeTitle,
  sanitizeSearchQuery,
  sanitizeUrl,
} from "../sanitization";

describe("sanitization utilities", () => {
  describe("sanitizeUserInput", () => {
    it("should remove null bytes and control characters", () => {
      const input = "Hello\x00World\x01Test\x1F";
      const result = sanitizeUserInput(input);
      expect(result).toBe("HelloWorldTest");
    });

    it("should normalize whitespace", () => {
      const input = "  Hello   World  \t\n  ";
      const result = sanitizeUserInput(input);
      expect(result).toBe("Hello World");
    });

    it("should handle empty input", () => {
      expect(sanitizeUserInput("")).toBe("");
      expect(sanitizeUserInput("   ")).toBe("");
    });

    it("should preserve regular text", () => {
      const input = "Hello World! This is normal text.";
      const result = sanitizeUserInput(input);
      expect(result).toBe(input);
    });
  });

  describe("sanitizeMessageContent", () => {
    it("should preserve newlines but normalize excessive ones", () => {
      const input = "Line 1\n\nLine 2\n\n\n\nLine 3";
      const result = sanitizeMessageContent(input);
      expect(result).toBe("Line 1\n\nLine 2\n\nLine 3");
    });

    it("should normalize spaces and tabs", () => {
      const input = "Hello  \t  World";
      const result = sanitizeMessageContent(input);
      expect(result).toBe("Hello World");
    });

    it("should remove control characters but preserve newlines", () => {
      const input = "Hello\x00\nWorld\x01\nTest";
      const result = sanitizeMessageContent(input);
      expect(result).toBe("Hello\nWorld\nTest");
    });

    it("should handle empty input", () => {
      expect(sanitizeMessageContent("")).toBe("");
      expect(sanitizeMessageContent("   \n\n  ")).toBe("");
    });
  });

  describe("sanitizeTitle", () => {
    it("should remove all control characters including newlines", () => {
      const input = "Title\nWith\tControl\x00Characters";
      const result = sanitizeTitle(input);
      expect(result).toBe("Title With Control Characters");
    });

    it("should normalize whitespace to single spaces", () => {
      const input = "  Title   With   Spaces  ";
      const result = sanitizeTitle(input);
      expect(result).toBe("Title With Spaces");
    });

    it("should handle empty input", () => {
      expect(sanitizeTitle("")).toBe("");
      expect(sanitizeTitle("   ")).toBe("");
    });
  });

  describe("sanitizeSearchQuery", () => {
    it("should remove potentially harmful SQL-like patterns", () => {
      const input = "search term'; DROP TABLE users; --";
      const result = sanitizeSearchQuery(input);
      expect(result).toBe("search term DROP TABLE users --");
    });

    it("should remove quotes and backslashes", () => {
      const input = 'search "term" with \\backslash';
      const result = sanitizeSearchQuery(input);
      expect(result).toBe("search term with backslash");
    });

    it("should normalize whitespace", () => {
      const input = "  search   term  ";
      const result = sanitizeSearchQuery(input);
      expect(result).toBe("search term");
    });

    it("should handle empty input", () => {
      expect(sanitizeSearchQuery("")).toBe("");
      expect(sanitizeSearchQuery("   ")).toBe("");
    });
  });

  describe("sanitizeUrl", () => {
    it("should allow valid HTTP URLs", () => {
      const validUrls = [
        "http://example.com",
        "https://example.com/path",
        "https://subdomain.example.com:8080/path?query=value",
      ];

      validUrls.forEach((url) => {
        const result = sanitizeUrl(url);
        expect(result).toBe(url);
      });
    });

    it("should reject non-HTTP protocols", () => {
      const invalidUrls = [
        "ftp://example.com",
        "javascript:alert(1)",
        "data:text/html,<script>alert(1)</script>",
        "file:///etc/passwd",
      ];

      invalidUrls.forEach((url) => {
        const result = sanitizeUrl(url);
        expect(result).toBe("");
      });
    });

    it("should reject URLs without protocol", () => {
      const result = sanitizeUrl("example.com");
      expect(result).toBe("");
    });

    it("should remove control characters from valid URLs", () => {
      const input = "https://example.com/path\x00\x01";
      const result = sanitizeUrl(input);
      expect(result).toBe("https://example.com/path");
    });

    it("should handle empty input", () => {
      expect(sanitizeUrl("")).toBe("");
      expect(sanitizeUrl("   ")).toBe("");
    });
  });
});
