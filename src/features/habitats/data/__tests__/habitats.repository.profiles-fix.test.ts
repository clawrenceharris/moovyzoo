import { describe, it, expect, beforeEach, vi } from "vitest";
import { HabitatRepository } from "../habitats.repository";

// Mock Supabase client
vi.mock("@/utils/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(),
          single: vi.fn(),
          order: vi.fn(() => ({
            order: vi.fn(),
          })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(),
          })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(),
          })),
        })),
      })),
    })),
  },
}));

describe("HabitatRepository - Profiles Table Fix", () => {
  let repository: HabitatRepository;

  beforeEach(() => {
    repository = new HabitatRepository();
    vi.clearAllMocks();
  });

  describe("Profile Query Consistency", () => {
    it("should use correct 'profiles' table name in getHabitatMembers query", async () => {
      // This test will fail until we fix the incorrect table references
      const { supabase } = await import("@/utils/supabase/client");

      // Mock the select method to capture the query string
      let capturedQuery = "";
      const mockSelect = vi.fn((query: string) => {
        capturedQuery = query;
        return {
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            })),
          })),
        };
      });

      const mockFrom = vi.fn(() => ({
        select: mockSelect,
      }));
      supabase.from = mockFrom;

      // Call the method that should use correct table name
      await repository.getHabitatMembers("test-habitat-id");

      // Verify the query uses 'user_profiles:user_id' not 'user_profiles:user_id'
      expect(capturedQuery).toContain("user_profiles:user_id");
      expect(capturedQuery).not.toContain("user_profiles:user_id");
    });

    it("should use correct 'profiles' table name in getHabitatDiscussions query", async () => {
      const { supabase } = await import("@/utils/supabase/client");

      let capturedQuery = "";
      const mockSelect = vi.fn((query: string) => {
        capturedQuery = query;
        return {
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            })),
          })),
        };
      });

      const mockFrom = vi.fn(() => ({
        select: mockSelect,
      }));
      supabase.from = mockFrom;

      await repository.getHabitatDiscussions("test-habitat-id");

      expect(capturedQuery).toContain("user_profiles:user_id");
      expect(capturedQuery).not.toContain("user_profiles:user_id");
    });

    it("should use correct 'profiles' table name in getHabitatPolls query", async () => {
      const { supabase } = await import("@/utils/supabase/client");

      let capturedQuery = "";
      const mockSelect = vi.fn((query: string) => {
        capturedQuery = query;
        return {
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            })),
          })),
        };
      });

      const mockFrom = vi.fn(() => ({
        select: mockSelect,
      }));
      supabase.from = mockFrom;

      await repository.getHabitatPolls("test-habitat-id");

      expect(capturedQuery).toContain("user_profiles:user_id");
      expect(capturedQuery).not.toContain("user_profiles:user_id");
    });
  });

  describe("Profile Data Transformation", () => {
    it("should correctly transform profile data from 'profiles' table", async () => {
      const mockMemberData = {
        id: "member-id",
        habitat_id: "habitat-id",
        user_id: "user-id",
        joined_at: "2024-01-01T00:00:00Z",
        user_profiles {
          display_name: "Test User",
          avatar_url: "avatar.jpg",
        },
      };

      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: [mockMemberData],
                error: null,
              }),
            })),
          })),
        })),
      }));
      supabase.from = mockFrom;

      const result = await repository.getHabitatMembers("habitat-id");

      // Should transform 'profiles' property to 'profile'
      expect(result[0]).toEqual({
        id: "member-id",
        habitat_id: "habitat-id",
        user_id: "user-id",
        joined_at: "2024-01-01T00:00:00Z",
        profile: {
          display_name: "Test User",
          avatar_url: "avatar.jpg",
        },
      });
    });

    it("should handle missing profile data gracefully", async () => {
      const mockMemberData = {
        id: "member-id",
        habitat_id: "habitat-id",
        user_id: "user-id",
        joined_at: "2024-01-01T00:00:00Z",
        user_profiles null,
      };

      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: [mockMemberData],
                error: null,
              }),
            })),
          })),
        })),
      }));
      supabase.from = mockFrom;

      const result = await repository.getHabitatMembers("habitat-id");

      // Should handle null profiles gracefully
      expect(result[0].profile).toBeUndefined();
    });
  });
});
