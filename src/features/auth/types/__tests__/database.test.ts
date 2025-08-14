// Test file to verify database types are correctly defined
import { describe, it, expect } from "vitest";
import type { Profile, ProfileInsert, ProfileUpdate } from "../database";

describe("Database Types", () => {
  it("should have correct Profile type structure", () => {
    // This test ensures our types match the expected database schema
    const mockProfile: Profile = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "test@example.com",
      display_name: "Test User",
      avatar_url: null,
      bio: null,
      favorite_genres: ["sci-fi", "action"],
      favorite_titles: ["Blade Runner", "The Matrix"],
      is_public: true,
      onboarding_completed: false,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
    };

    expect(mockProfile.id).toBeDefined();
    expect(mockProfile.email).toBeDefined();
    expect(mockProfile.display_name).toBeDefined();
    expect(Array.isArray(mockProfile.favorite_genres)).toBe(true);
    expect(Array.isArray(mockProfile.favorite_titles)).toBe(true);
    expect(typeof mockProfile.is_public).toBe("boolean");
    expect(typeof mockProfile.onboarding_completed).toBe("boolean");
  });

  it("should have correct ProfileInsert type structure", () => {
    const mockInsert: ProfileInsert = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "test@example.com",
      display_name: "Test User",
      favorite_genres: ["sci-fi"],
      is_public: true,
    };

    expect(mockInsert.id).toBeDefined();
    expect(mockInsert.email).toBeDefined();
    expect(mockInsert.display_name).toBeDefined();
  });

  it("should have correct ProfileUpdate type structure", () => {
    const mockUpdate: ProfileUpdate = {
      display_name: "Updated Name",
      bio: "Updated bio",
      favorite_genres: ["comedy", "drama"],
      is_public: false,
    };

    expect(mockUpdate.display_name).toBeDefined();
    expect(mockUpdate.bio).toBeDefined();
    expect(Array.isArray(mockUpdate.favorite_genres)).toBe(true);
    expect(typeof mockUpdate.is_public).toBe("boolean");
  });

  it("should allow optional fields in ProfileInsert", () => {
    const minimalInsert: ProfileInsert = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "test@example.com",
      display_name: "Test User",
    };

    expect(minimalInsert.id).toBeDefined();
    expect(minimalInsert.email).toBeDefined();
    expect(minimalInsert.display_name).toBeDefined();
  });

  it("should allow partial updates in ProfileUpdate", () => {
    const partialUpdate: ProfileUpdate = {
      display_name: "New Name",
    };

    expect(partialUpdate.display_name).toBeDefined();
  });
});
