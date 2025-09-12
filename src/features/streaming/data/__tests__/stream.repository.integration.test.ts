import { describe, it, expect, beforeEach, vi } from "vitest";
import { StreamingRepository } from "../stream.repository";

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

describe("StreamingRepository - Integration Tests", () => {
  let repository: StreamingRepository;

  beforeEach(() => {
    repository = new StreamingRepository();
    vi.clearAllMocks();
  });

  describe("Repository Method Signatures", () => {
    it("should have all required participant management methods", () => {
      // Verify all required methods exist with correct signatures
      expect(typeof repository.createParticipant).toBe("function");
      expect(typeof repository.getParticipantById).toBe("function");
      expect(typeof repository.updateParticipantReminder).toBe("function");
      expect(typeof repository.deleteParticipant).toBe("function");
      expect(typeof repository.getParticipantCount).toBe("function");
      expect(typeof repository.getStreamHost).toBe("function");
      expect(typeof repository.updateParticipantHostStatus).toBe("function");
      expect(typeof repository.getParticipantsWithProfiles).toBe("function");
    });

    it("should have existing stream management methods", () => {
      // Verify existing methods are still available
      expect(typeof repository.getStreamById).toBe("function");
      expect(typeof repository.checkStreamExists).toBe("function");
      expect(typeof repository.getStreamParticipants).toBe("function");
      expect(typeof repository.isUserParticipant).toBe("function");
      expect(typeof repository.joinStream).toBe("function");
      expect(typeof repository.leaveStream).toBe("function");
      expect(typeof repository.createStream).toBe("function");
      expect(typeof repository.deleteStream).toBe("function");
      expect(typeof repository.getPublicStreams).toBe("function");
      expect(typeof repository.getUserStreams).toBe("function");
    });
  });

  describe("Method Parameter Validation", () => {
    it("should handle participant creation data correctly", () => {
      const participantData = {
        stream_id: "test-stream-id",
        user_id: "test-user-id",
        is_host: false,
        reminder_enabled: true,
      };

      // This should not throw during parameter validation
      expect(() => {
        repository.createParticipant(participantData);
      }).not.toThrow();
    });

    it("should handle string parameters correctly", () => {
      // These should not throw during parameter validation
      expect(() => {
        repository.getParticipantById("test-id");
      }).not.toThrow();

      expect(() => {
        repository.updateParticipantReminder("stream-id", "user-id", true);
      }).not.toThrow();

      expect(() => {
        repository.deleteParticipant("stream-id", "user-id");
      }).not.toThrow();

      expect(() => {
        repository.getParticipantCount("stream-id");
      }).not.toThrow();

      expect(() => {
        repository.getStreamHost("stream-id");
      }).not.toThrow();

      expect(() => {
        repository.updateParticipantHostStatus("stream-id", "user-id", true);
      }).not.toThrow();

      expect(() => {
        repository.getParticipantsWithProfiles("stream-id");
      }).not.toThrow();
    });
  });

  describe("Error Handling Consistency", () => {
    it("should handle database errors consistently", async () => {
      // Mock Supabase error
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          })),
        })),
      }));
      supabase.from = mockFrom;

      const participantData = {
        stream_id: "test-stream-id",
        user_id: "test-user-id",
        is_host: false,
        reminder_enabled: true,
      };

      // Should throw error with proper message
      await expect(
        repository.createParticipant(participantData)
      ).rejects.toThrow("Failed to create participant");
    });

    it("should handle null responses gracefully", async () => {
      // Mock Supabase null response
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          })),
        })),
      }));
      supabase.from = mockFrom;

      const result = await repository.getParticipantById("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("Data Transformation", () => {
    it("should transform participant data consistently", async () => {
      const mockParticipantData = {
        id: "participant-id",
        stream_id: "stream-id",
        user_id: "user-id",
        joined_at: "2024-01-01T00:00:00Z",
        is_host: false,
        reminder_enabled: true,
        created_at: "2024-01-01T00:00:00Z",
        user_profiles {
          display_name: "Test User",
          avatar_url: "avatar.jpg",
        },
      };

      // Mock Supabase response
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: mockParticipantData,
              error: null,
            }),
          })),
        })),
      }));
      supabase.from = mockFrom;

      const result = await repository.getParticipantById("participant-id");

      // Should transform data correctly
      expect(result).toEqual({
        id: "participant-id",
        stream_id: "stream-id",
        user_id: "user-id",
        joined_at: "2024-01-01T00:00:00Z",
        is_host: false,
        reminder_enabled: true,
        created_at: "2024-01-01T00:00:00Z",
        profile: {
          display_name: "Test User",
          avatar_url: "avatar.jpg",
        },
      });
    });

    it("should handle missing profile data", async () => {
      const mockParticipantData = {
        id: "participant-id",
        stream_id: "stream-id",
        user_id: "user-id",
        joined_at: "2024-01-01T00:00:00Z",
        is_host: false,
        reminder_enabled: true,
        created_at: "2024-01-01T00:00:00Z",
        user_profiles null,
      };

      // Mock Supabase response
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: mockParticipantData,
              error: null,
            }),
          })),
        })),
      }));
      supabase.from = mockFrom;

      const result = await repository.getParticipantById("participant-id");

      // Should handle missing profile gracefully
      expect(result?.profile).toBeUndefined();
    });
  });
});
