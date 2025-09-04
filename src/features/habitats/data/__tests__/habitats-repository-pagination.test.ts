import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase client
vi.mock("@/utils/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gt: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(),
            })),
          })),
          order: vi.fn(() => ({
            limit: vi.fn(),
            range: vi.fn(),
          })),
        })),
        order: vi.fn(() => ({
          limit: vi.fn(),
          range: vi.fn(),
        })),
        in: vi.fn(),
      })),
    })),
  },
}));

import { HabitatsRepository } from "../habitats.repository";
import { supabase } from "@/utils/supabase/client";

const mockSupabase = supabase as any;

describe("HabitatsRepository - Pagination Optimizations", () => {
  let repository: HabitatsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new HabitatsRepository();
  });

  describe("getMessagesByDiscussionCursor", () => {
    it("should use cursor-based pagination for better performance", async () => {
      // Arrange
      const mockMessages = [
        {
          id: "msg-3",
          habitat_id: "habitat-123",
          chat_id: "discussion-123",
          user_id: "user-1",
          content: "Latest message",
          created_at: "2023-01-01T02:00:00Z",
          profiles: {
            display_name: "John Doe",
            avatar_url: "https://example.com/avatar.jpg",
          },
        },
        {
          id: "msg-4",
          habitat_id: "habitat-123",
          chat_id: "discussion-123",
          user_id: "user-2",
          content: "Another message",
          created_at: "2023-01-01T01:30:00Z",
          profiles: {
            display_name: "Jane Smith",
            avatar_url: null,
          },
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gt: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: mockMessages,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await repository.getMessagesByDiscussionCursor(
        "discussion-123",
        "2023-01-01T01:00:00Z",
        20
      );

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("habitat_messages");
      expect(result).toHaveLength(2);
      expect(result[0].created_at).toBe("2023-01-01T02:00:00Z");
    });

    it("should handle first page when no cursor provided", async () => {
      // Arrange
      const mockMessages = [
        {
          id: "msg-1",
          habitat_id: "habitat-123",
          chat_id: "discussion-123",
          user_id: "user-1",
          content: "First message",
          created_at: "2023-01-01T00:00:00Z",
          profiles: {
            display_name: "John Doe",
            avatar_url: "https://example.com/avatar.jpg",
          },
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: mockMessages,
                error: null,
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await repository.getMessagesByDiscussionCursor(
        "discussion-123",
        undefined,
        20
      );

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("msg-1");
    });
  });

  describe("batchGetHabitatsByIds", () => {
    it("should fetch multiple habitats in a single query", async () => {
      // Arrange
      const habitatIds = ["habitat-1", "habitat-2", "habitat-3"];
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
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: mockHabitats,
            error: null,
          }),
        }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      // Act
      const result = await repository.batchGetHabitatsByIds(habitatIds);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("habitats");
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("habitat-1");
      expect(result[1].id).toBe("habitat-2");
    });

    it("should handle empty habitat IDs array", async () => {
      // Act
      const result = await repository.batchGetHabitatsByIds([]);

      // Assert
      expect(result).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });

  describe("getHabitatMembersWithPagination", () => {
    it("should efficiently paginate through large member lists", async () => {
      // Arrange
      const mockMembers = [
        {
          habitat_id: "habitat-123",
          user_id: "user-1",
          joined_at: "2023-01-01T00:00:00Z",
          last_active: "2023-01-01T12:00:00Z",
        },
        {
          habitat_id: "habitat-123",
          user_id: "user-2",
          joined_at: "2023-01-01T01:00:00Z",
          last_active: "2023-01-01T11:00:00Z",
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({
                data: mockMembers,
                error: null,
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await repository.getHabitatMembersWithPagination(
        "habitat-123",
        50,
        0
      );

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("habitat_members");
      expect(result).toHaveLength(2);
      expect(result[0].user_id).toBe("user-1");
    });
  });
});
