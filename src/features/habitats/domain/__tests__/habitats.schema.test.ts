/**
 * Unit tests for habitats schema validation
 * Ensures refactored schemas maintain existing functionality
 */

import { describe, it, expect } from "vitest";
import {
  messageContentSchema,
  discussionNameSchema,
  habitatNameSchema,
  createHabitatSchema,
  createDiscussionSchema,
  watchPartyMediaSchema,
  scheduledTimeSchema,
  maxParticipantsSchema,
  getDiscussionsByHabitatSchema,
} from "../habitats.schema";

describe("habitats schema validation", () => {
  describe("messageContentSchema", () => {
    it("should validate message content", () => {
      expect(() => messageContentSchema.parse("Hello world")).not.toThrow();
    });

    it("should reject empty messages", () => {
      expect(() => messageContentSchema.parse("")).toThrow();
      expect(() => messageContentSchema.parse("   ")).toThrow();
    });

    it("should trim message content", () => {
      const result = messageContentSchema.parse("  Hello world  ");
      expect(result).toBe("Hello world");
    });
  });

  describe("discussionNameSchema", () => {
    it("should validate discussion names", () => {
      expect(() =>
        discussionNameSchema.parse("Great Movie Discussion")
      ).not.toThrow();
    });

    it("should reject short names", () => {
      expect(() => discussionNameSchema.parse("AB")).toThrow();
    });
  });

  describe("habitatNameSchema", () => {
    it("should validate habitat names", () => {
      expect(() => habitatNameSchema.parse("Movie Lovers")).not.toThrow();
    });

    it("should reject empty names", () => {
      expect(() => habitatNameSchema.parse("")).toThrow();
      expect(() => habitatNameSchema.parse("   ")).toThrow();
    });
  });

  describe("createHabitatSchema", () => {
    it("should validate habitat creation data", () => {
      const habitatData = {
        name: "Movie Lovers",
        description: "A place for movie enthusiasts",
        isPublic: true,
      };

      expect(() => createHabitatSchema.parse(habitatData)).not.toThrow();
    });

    it("should use default for isPublic", () => {
      const habitatData = {
        name: "Movie Lovers",
        description: "A place for movie enthusiasts",
      };

      const result = createHabitatSchema.parse(habitatData);
      expect(result.isPublic).toBe(true);
    });
  });

  describe("createDiscussionSchema", () => {
    it("should validate discussion creation data", () => {
      const discussionData = {
        name: "Great Movie Discussion",
        description: "Let's talk about this amazing film",
      };

      expect(() => createDiscussionSchema.parse(discussionData)).not.toThrow();
    });
  });

  describe("watchPartyMediaSchema", () => {
    it("should validate watch party media data", () => {
      const mediaData = {
        tmdb_id: 12345,
        media_type: "movie" as const,
        media_title: "Test Movie",
        poster_path: "/poster.jpg",
        release_date: "2024-01-01",
        runtime: 120,
      };

      expect(() => watchPartyMediaSchema.parse(mediaData)).not.toThrow();
    });

    it("should require tmdb_id and media_type", () => {
      const mediaData = {
        media_title: "Test Movie",
      };

      expect(() => watchPartyMediaSchema.parse(mediaData)).toThrow();
    });
  });

  describe("scheduledTimeSchema", () => {
    it("should validate future dates", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString();

      expect(() => scheduledTimeSchema.parse(futureDateString)).not.toThrow();
    });

    it("should reject past dates", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const pastDateString = pastDate.toISOString();

      expect(() => scheduledTimeSchema.parse(pastDateString)).toThrow();
    });
  });

  describe("maxParticipantsSchema", () => {
    it("should validate participant counts", () => {
      expect(() => maxParticipantsSchema.parse(10)).not.toThrow();
    });

    it("should reject values below minimum", () => {
      expect(() => maxParticipantsSchema.parse(1)).toThrow();
    });

    it("should reject values above maximum", () => {
      expect(() => maxParticipantsSchema.parse(101)).toThrow();
    });

    it("should handle optional values", () => {
      expect(() => maxParticipantsSchema.parse(undefined)).not.toThrow();
    });
  });

  describe("getDiscussionsByHabitatSchema", () => {
    it("should validate pagination parameters", () => {
      const params = {
        limit: 20,
        offset: 0,
        sortBy: "created_at",
        sortOrder: "desc" as const,
      };

      expect(() => getDiscussionsByHabitatSchema.parse(params)).not.toThrow();
    });

    it("should use default values", () => {
      const result = getDiscussionsByHabitatSchema.parse({});

      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
      expect(result.sortOrder).toBe("desc");
    });

    it("should reject invalid limit values", () => {
      expect(() => getDiscussionsByHabitatSchema.parse({ limit: 0 })).toThrow();
      expect(() =>
        getDiscussionsByHabitatSchema.parse({ limit: 101 })
      ).toThrow();
    });
  });
});
