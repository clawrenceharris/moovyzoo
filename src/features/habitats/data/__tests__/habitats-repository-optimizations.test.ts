import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase client
vi.mock("@/utils/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
          })),
          single: vi.fn(),
          order: vi.fn(() => ({
            range: vi.fn(),
          })),
        })),
        order: vi.fn(() => ({
          range: vi.fn(),
        })),
        range: vi.fn(),
      })),
    })),
  },
}));

import { HabitatsRepository } from "../habitats.repository";
import { supabase } from "@/utils/supabase/client";

const mockSupabase = supabase as any;

describe("HabitatsRepository - Query Optimizations", () => {
  let repository: HabitatsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new HabitatsRepository();
  });

  describe("getHabitatByIdOptimized", () => {
    it("should fetch habitat and membership in a single query", async () => {
      // Arrange
      const mockHabitatWithMembership = {
        id: "habitat-123",
        name: "Test Habitat",
        description: "Test Description",
        tags: ["test"],
        is_public: true,
        created_by: "user-123",
        member_count: 5,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        banner_url: null,
        habitat_members: [
          {
            user_id: "user-456",
            joined_at: "2023-01-01T00:00:00Z",
            last_active: "2023-01-01T00:00:00Z",
          },
        ],
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockHabitatWithMembership,
                error: null,
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await repository.getHabitatByIdOptimized(
        "habitat-123",
        "user-456"
      );

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
      expect(mockSupabase.from).toHaveBeenCalledWith("habitats");
      expect(result.is_member).toBe(true);
      expect(result.user_role).toBe("member");
    });

    it("should handle user not being a member", async () => {
      // Arrange
      const mockHabitatWithoutMembership = {
        id: "habitat-123",
        name: "Test Habitat",
        description: "Test Description",
        tags: ["test"],
        is_public: true,
        created_by: "user-123",
        member_count: 5,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        banner_url: null,
        habitat_members: [], // No membership found
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockHabitatWithoutMembership,
                error: null,
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await repository.getHabitatByIdOptimized(
        "habitat-123",
        "user-456"
      );

      // Assert
      expect(result.is_member).toBe(false);
      expect(result.user_role).toBeUndefined();
    });

    it("should identify habitat owner correctly", async () => {
      // Arrange
      const mockHabitatOwner = {
        id: "habitat-123",
        name: "Test Habitat",
        description: "Test Description",
        tags: ["test"],
        is_public: true,
        created_by: "user-456", // User is the owner
        member_count: 5,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        banner_url: null,
        habitat_members: [
          {
            user_id: "user-456",
            joined_at: "2023-01-01T00:00:00Z",
            last_active: "2023-01-01T00:00:00Z",
          },
        ],
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockHabitatOwner,
                error: null,
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await repository.getHabitatByIdOptimized(
        "habitat-123",
        "user-456"
      );

      // Assert
      expect(result.is_member).toBe(true);
      expect(result.user_role).toBe("owner");
    });
  });

  describe("getMessagesByDiscussionOptimized", () => {
    it("should fetch messages with profiles in a single query with proper pagination", async () => {
      // Arrange
      const mockMessages = [
        {
          id: "msg-1",
          habitat_id: "habitat-123",
          chat_id: "discussion-123",
          user_id: "user-1",
          content: "Hello world",
          created_at: "2023-01-01T00:00:00Z",
          profiles: {
            display_name: "John Doe",
            avatar_url: "https://example.com/avatar.jpg",
          },
        },
        {
          id: "msg-2",
          habitat_id: "habitat-123",
          chat_id: "discussion-123",
          user_id: "user-2",
          content: "Hi there",
          created_at: "2023-01-01T01:00:00Z",
          profiles: {
            display_name: "Jane Smith",
            avatar_url: null,
          },
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({
                data: mockMessages,
                error: null,
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await repository.getMessagesByDiscussionOptimized(
        "discussion-123",
        50,
        0
      );

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
      expect(mockSupabase.from).toHaveBeenCalledWith("habitat_messages");
      expect(result).toHaveLength(2);
      expect(result[0].user_profile.display_name).toBe("John Doe");
      expect(result[1].user_profile.display_name).toBe("Jane Smith");
    });

    it("should handle empty results gracefully", async () => {
      // Arrange
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await repository.getMessagesByDiscussionOptimized(
        "discussion-123",
        50,
        0
      );

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getDiscussionsByHabitatOptimized", () => {
    it("should fetch discussions with message counts in a single query", async () => {
      // Arrange
      const mockDiscussions = [
        {
          id: "discussion-1",
          habitat_id: "habitat-123",
          name: "General Discussion",
          description: "Main chat",
          created_by: "user-1",
          created_at: "2023-01-01T00:00:00Z",
          is_active: true,
          message_count: [{ count: 25 }],
          last_message: [{ created_at: "2023-01-01T12:00:00Z" }],
        },
        {
          id: "discussion-2",
          habitat_id: "habitat-123",
          name: "Movie Reviews",
          description: "Discuss movies",
          created_by: "user-2",
          created_at: "2023-01-01T01:00:00Z",
          is_active: true,
          message_count: [{ count: 10 }],
          last_message: [{ created_at: "2023-01-01T11:00:00Z" }],
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockDiscussions,
                error: null,
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await repository.getDiscussionsByHabitatOptimized(
        "habitat-123"
      );

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
      expect(mockSupabase.from).toHaveBeenCalledWith("habitat_discussions");
      expect(result).toHaveLength(2);
      expect(result[0].message_count).toBe(25);
      expect(result[1].message_count).toBe(10);
    });
  });

  describe("getUserJoinedHabitatsOptimized", () => {
    it("should fetch user habitats with membership info in a single optimized query", async () => {
      // Arrange
      const mockHabitats = [
        {
          id: "habitat-1",
          name: "Habitat One",
          description: "First habitat",
          tags: ["tag1"],
          is_public: true,
          created_by: "user-1",
          member_count: 10,
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2023-01-01T00:00:00Z",
          banner_url: null,
          habitat_members: [
            {
              joined_at: "2023-01-01T00:00:00Z",
              last_active: "2023-01-01T12:00:00Z",
            },
          ],
        },
        {
          id: "habitat-2",
          name: "Habitat Two",
          description: "Second habitat",
          tags: ["tag2"],
          is_public: false,
          created_by: "user-2",
          member_count: 5,
          created_at: "2023-01-01T01:00:00Z",
          updated_at: "2023-01-01T01:00:00Z",
          banner_url: null,
          habitat_members: [
            {
              joined_at: "2023-01-01T01:00:00Z",
              last_active: "2023-01-01T13:00:00Z",
            },
          ],
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockHabitats,
              error: null,
            }),
          }),
        }),
      });

      // Act
      const result = await repository.getUserJoinedHabitatsOptimized(
        "user-123"
      );

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
      expect(mockSupabase.from).toHaveBeenCalledWith("habitats");
      expect(result).toHaveLength(2);
      expect(result[0].is_member).toBe(true);
      expect(result[1].is_member).toBe(true);
    });
  });
});
