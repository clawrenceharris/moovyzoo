/**
 * Unit tests for schema helper utilities
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  commonSchemas,
  createPaginationSchema,
  createSearchSchema,
  createMemberSchema,
  createTimeBasedSchema,
  createMediaSchema,
  createResponseSchema,
} from "../schema-helpers";

describe("schema helpers", () => {
  describe("commonSchemas", () => {
    describe("uuid", () => {
      it("should validate correct UUID format", () => {
        const validUUIDs = [
          "123e4567-e89b-12d3-a456-426614174000",
          "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        ];

        validUUIDs.forEach((uuid) => {
          expect(() => commonSchemas.uuid.parse(uuid)).not.toThrow();
        });
      });

      it("should reject invalid UUID format", () => {
        const invalidUUIDs = ["", "not-a-uuid", "123-456"];

        invalidUUIDs.forEach((uuid) => {
          expect(() => commonSchemas.uuid.parse(uuid)).toThrow();
        });
      });
    });

    describe("email", () => {
      it("should validate correct email format", () => {
        const validEmails = [
          "test@example.com",
          "user.name@domain.co.uk",
          "user+tag@example.org",
        ];

        validEmails.forEach((email) => {
          expect(() => commonSchemas.email.parse(email)).not.toThrow();
        });
      });

      it("should reject invalid email format", () => {
        const invalidEmails = ["", "not-an-email", "@domain.com", "user@"];

        invalidEmails.forEach((email) => {
          expect(() => commonSchemas.email.parse(email)).toThrow();
        });
      });
    });

    describe("messageContent", () => {
      it("should validate and trim message content", () => {
        const result = commonSchemas.messageContent.parse("  Hello World  ");
        expect(result).toBe("Hello World");
      });

      it("should reject empty messages", () => {
        expect(() => commonSchemas.messageContent.parse("")).toThrow();
        expect(() => commonSchemas.messageContent.parse("   ")).toThrow();
      });

      it("should reject messages that are too long", () => {
        const longMessage = "A".repeat(1001);
        expect(() => commonSchemas.messageContent.parse(longMessage)).toThrow();
      });

      it("should accept messages at the limit", () => {
        const maxMessage = "A".repeat(1000);
        expect(() =>
          commonSchemas.messageContent.parse(maxMessage)
        ).not.toThrow();
      });
    });

    describe("habitatName", () => {
      it("should validate and trim habitat names", () => {
        const result = commonSchemas.habitatName.parse("  Movie Lovers  ");
        expect(result).toBe("Movie Lovers");
      });

      it("should reject empty names", () => {
        expect(() => commonSchemas.habitatName.parse("")).toThrow();
        expect(() => commonSchemas.habitatName.parse("   ")).toThrow();
      });

      it("should reject names that are too long", () => {
        const longName = "A".repeat(101);
        expect(() => commonSchemas.habitatName.parse(longName)).toThrow();
      });
    });

    describe("discussionTitle", () => {
      it("should validate and trim discussion titles", () => {
        const result = commonSchemas.discussionTitle.parse("  Great Movie  ");
        expect(result).toBe("Great Movie");
      });

      it("should reject titles that are too short", () => {
        expect(() => commonSchemas.discussionTitle.parse("AB")).toThrow();
      });

      it("should reject titles that are too long", () => {
        const longTitle = "A".repeat(201);
        expect(() => commonSchemas.discussionTitle.parse(longTitle)).toThrow();
      });

      it("should accept minimum length titles", () => {
        expect(() => commonSchemas.discussionTitle.parse("ABC")).not.toThrow();
      });
    });

    describe("positiveInt", () => {
      it("should validate positive integers", () => {
        expect(() => commonSchemas.positiveInt.parse(1)).not.toThrow();
        expect(() => commonSchemas.positiveInt.parse(100)).not.toThrow();
      });

      it("should reject zero and negative numbers", () => {
        expect(() => commonSchemas.positiveInt.parse(0)).toThrow();
        expect(() => commonSchemas.positiveInt.parse(-1)).toThrow();
      });

      it("should reject non-integers", () => {
        expect(() => commonSchemas.positiveInt.parse(1.5)).toThrow();
      });
    });

    describe("nonNegativeInt", () => {
      it("should validate non-negative integers", () => {
        expect(() => commonSchemas.nonNegativeInt.parse(0)).not.toThrow();
        expect(() => commonSchemas.nonNegativeInt.parse(1)).not.toThrow();
        expect(() => commonSchemas.nonNegativeInt.parse(100)).not.toThrow();
      });

      it("should reject negative numbers", () => {
        expect(() => commonSchemas.nonNegativeInt.parse(-1)).toThrow();
      });
    });
  });

  describe("createPaginationSchema", () => {
    it("should create pagination schema with default values", () => {
      const schema = createPaginationSchema();
      const result = schema.parse({});

      expect(result).toEqual({
        page: 1,
        limit: 20,
        sortOrder: "desc",
      });
    });

    it("should validate pagination parameters", () => {
      const schema = createPaginationSchema();
      const result = schema.parse({
        page: 2,
        limit: 50,
        sortBy: "created_at",
        sortOrder: "asc",
      });

      expect(result).toEqual({
        page: 2,
        limit: 50,
        sortBy: "created_at",
        sortOrder: "asc",
      });
    });

    it("should respect custom max limit", () => {
      const schema = createPaginationSchema(50);

      expect(() => schema.parse({ limit: 51 })).toThrow();
      expect(() => schema.parse({ limit: 50 })).not.toThrow();
    });

    it("should reject invalid page numbers", () => {
      const schema = createPaginationSchema();

      expect(() => schema.parse({ page: 0 })).toThrow();
      expect(() => schema.parse({ page: -1 })).toThrow();
    });
  });

  describe("createSearchSchema", () => {
    it("should create search schema with pagination", () => {
      const schema = createSearchSchema();
      const result = schema.parse({ query: "test query" });

      expect(result.query).toBe("test query");
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it("should trim search queries", () => {
      const schema = createSearchSchema();
      const result = schema.parse({ query: "  test query  " });

      expect(result.query).toBe("test query");
    });

    it("should validate query length", () => {
      const schema = createSearchSchema(3, 10);

      expect(() => schema.parse({ query: "AB" })).toThrow(); // too short
      expect(() => schema.parse({ query: "A".repeat(11) })).toThrow(); // too long
      expect(() => schema.parse({ query: "ABC" })).not.toThrow(); // valid
    });

    it("should handle optional filters", () => {
      const schema = createSearchSchema();
      const result = schema.parse({
        query: "test",
        filters: { genre: "action", year: "2023" },
      });

      expect(result.filters).toEqual({ genre: "action", year: "2023" });
    });
  });

  describe("createMemberSchema", () => {
    it("should validate member data", () => {
      const schema = createMemberSchema();
      const validUUID = "123e4567-e89b-12d3-a456-426614174000";

      const result = schema.parse({
        userId: validUUID,
        habitatId: validUUID,
        role: "moderator",
      });

      expect(result).toEqual({
        userId: validUUID,
        habitatId: validUUID,
        role: "moderator",
      });
    });

    it("should use default role", () => {
      const schema = createMemberSchema();
      const validUUID = "123e4567-e89b-12d3-a456-426614174000";

      const result = schema.parse({
        userId: validUUID,
        habitatId: validUUID,
      });

      expect(result.role).toBe("member");
    });

    it("should reject invalid roles", () => {
      const schema = createMemberSchema();
      const validUUID = "123e4567-e89b-12d3-a456-426614174000";

      expect(() =>
        schema.parse({
          userId: validUUID,
          habitatId: validUUID,
          role: "invalid-role",
        })
      ).toThrow();
    });
  });

  describe("createTimeBasedSchema", () => {
    it("should validate time-based data", () => {
      const schema = createTimeBasedSchema();
      const startTime = "2024-01-01T10:00:00Z";
      const endTime = "2024-01-01T12:00:00Z";

      const result = schema.parse({
        startTime,
        endTime,
        timezone: "America/New_York",
      });

      expect(result).toEqual({
        startTime,
        endTime,
        timezone: "America/New_York",
      });
    });

    it("should use default timezone", () => {
      const schema = createTimeBasedSchema();
      const result = schema.parse({
        startTime: "2024-01-01T10:00:00Z",
      });

      expect(result.timezone).toBe("UTC");
    });

    it("should reject end time before start time", () => {
      const schema = createTimeBasedSchema();

      expect(() =>
        schema.parse({
          startTime: "2024-01-01T12:00:00Z",
          endTime: "2024-01-01T10:00:00Z", // before start time
        })
      ).toThrow();
    });

    it("should accept end time after start time", () => {
      const schema = createTimeBasedSchema();

      expect(() =>
        schema.parse({
          startTime: "2024-01-01T10:00:00Z",
          endTime: "2024-01-01T12:00:00Z",
        })
      ).not.toThrow();
    });
  });

  describe("createMediaSchema", () => {
    it("should validate media data", () => {
      const schema = createMediaSchema();
      const mediaData = {
        tmdbId: 12345,
        mediaType: "movie" as const,
        title: "Test Movie",
        posterPath: "/poster.jpg",
        backdropPath: "/backdrop.jpg",
        releaseDate: "2024-01-01",
        overview: "A test movie",
      };

      const result = schema.parse(mediaData);
      expect(result).toEqual(mediaData);
    });

    it("should require tmdbId and mediaType", () => {
      const schema = createMediaSchema();

      expect(() =>
        schema.parse({
          title: "Test Movie",
        })
      ).toThrow();
    });

    it("should validate mediaType enum", () => {
      const schema = createMediaSchema();

      expect(() =>
        schema.parse({
          tmdbId: 123,
          mediaType: "invalid",
          title: "Test",
        })
      ).toThrow();
    });
  });

  describe("createResponseSchema", () => {
    it("should validate successful response", () => {
      const dataSchema = z.object({ id: z.string(), name: z.string() });
      const responseSchema = createResponseSchema(dataSchema);

      const response = {
        success: true,
        data: { id: "123", name: "Test" },
      };

      const result = responseSchema.parse(response);
      expect(result).toEqual(response);
    });

    it("should validate error response", () => {
      const dataSchema = z.object({ id: z.string() });
      const responseSchema = createResponseSchema(dataSchema);

      const response = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Resource not found",
          details: { resource: "habitat" },
        },
      };

      const result = responseSchema.parse(response);
      expect(result).toEqual(response);
    });

    it("should validate response with pagination", () => {
      const dataSchema = z.array(z.object({ id: z.string() }));
      const responseSchema = createResponseSchema(dataSchema);

      const response = {
        success: true,
        data: [{ id: "1" }, { id: "2" }],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      };

      const result = responseSchema.parse(response);
      expect(result).toEqual(response);
    });
  });
});
