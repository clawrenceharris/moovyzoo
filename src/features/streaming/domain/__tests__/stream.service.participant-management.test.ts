import { describe, it, expect, beforeEach, vi } from "vitest";
import { StreamService } from "../stream.service";
import { AppErrorCode } from "@/utils/error-codes";
import type { ParticipantJoinData, StreamParticipant } from "../stream.types";

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
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
    removeChannel: vi.fn(),
    rpc: vi.fn(),
  },
}));

// Mock repository
vi.mock("../data/stream.repository", () => ({
  StreamingRepository: vi.fn(() => ({
    getStreamById: vi.fn(),
    getStreamParticipants: vi.fn(),
  })),
}));

describe("StreamService - Participant Management", () => {
  let streamService: StreamService;
  const mockStreamId = "test-stream-id";
  const mockUserId = "test-user-id";

  beforeEach(() => {
    streamService = new StreamService();
    vi.clearAllMocks();
  });

  describe("joinStreamEnhanced", () => {
    it("should successfully join a stream as first participant (becomes host)", async () => {
      const joinData: ParticipantJoinData = {
        streamId: mockStreamId,
        userId: mockUserId,
        reminderEnabled: true,
      };

      const mockStream = {
        id: mockStreamId,
        is_active: true,
        participant_count: 0,
        max_participants: 10,
        scheduled_time: new Date(Date.now() + 60000).toISOString(),
      };

      const mockParticipant: StreamParticipant = {
        id: "participant-id",
        stream_id: mockStreamId,
        user_id: mockUserId,
        joined_at: new Date().toISOString(),
        is_host: true,
        reminder_enabled: true,
        created_at: new Date().toISOString(),
        profile: {
          display_name: "Test User",
          avatar_url: "test-avatar.jpg",
        },
      };

      // Mock repository methods
      streamService["repository"].getStreamById = vi
        .fn()
        .mockResolvedValue(mockStream);
      streamService["repository"].getStreamParticipants = vi
        .fn()
        .mockResolvedValue([]);
      streamService.getParticipantByUserId = vi.fn().mockResolvedValue(null);

      // Mock Supabase insert
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "participant-id",
                stream_id: mockStreamId,
                user_id: mockUserId,
                joined_at: new Date().toISOString(),
                is_host: true,
                reminder_enabled: true,
                created_at: new Date().toISOString(),
                user_profiles {
                  display_name: "Test User",
                  avatar_url: "test-avatar.jpg",
                },
              },
              error: null,
            }),
          })),
        })),
      }));
      supabase.from = mockFrom;

      const result = await streamService.joinStreamEnhanced(joinData);

      expect(result).toEqual(
        expect.objectContaining({
          stream_id: mockStreamId,
          user_id: mockUserId,
          is_host: true,
          reminder_enabled: true,
        })
      );
    });

    it("should throw error when stream does not exist", async () => {
      const joinData: ParticipantJoinData = {
        streamId: mockStreamId,
        userId: mockUserId,
      };

      streamService["repository"].getStreamById = vi
        .fn()
        .mockResolvedValue(null);

      await expect(
        streamService.joinStreamEnhanced(joinData)
      ).rejects.toThrow();
    });

    it("should throw error when user is already a participant", async () => {
      const joinData: ParticipantJoinData = {
        streamId: mockStreamId,
        userId: mockUserId,
      };

      const mockStream = {
        id: mockStreamId,
        is_active: true,
        participant_count: 1,
        max_participants: 10,
        scheduled_time: new Date(Date.now() + 60000).toISOString(),
      };

      const mockExistingParticipant: StreamParticipant = {
        id: "existing-id",
        stream_id: mockStreamId,
        user_id: mockUserId,
        joined_at: new Date().toISOString(),
        is_host: false,
        reminder_enabled: false,
        created_at: new Date().toISOString(),
      };

      streamService["repository"].getStreamById = vi
        .fn()
        .mockResolvedValue(mockStream);
      streamService.getParticipantByUserId = vi
        .fn()
        .mockResolvedValue(mockExistingParticipant);

      await expect(
        streamService.joinStreamEnhanced(joinData)
      ).rejects.toThrow();
    });

    it("should validate input parameters", async () => {
      const invalidJoinData = {
        streamId: "",
        userId: mockUserId,
      };

      await expect(
        streamService.joinStreamEnhanced(invalidJoinData)
      ).rejects.toThrow();
    });
  });

  describe("leaveStreamEnhanced", () => {
    it("should successfully leave a stream", async () => {
      const mockParticipant: StreamParticipant = {
        id: "participant-id",
        stream_id: mockStreamId,
        user_id: mockUserId,
        joined_at: new Date().toISOString(),
        is_host: false,
        reminder_enabled: false,
        created_at: new Date().toISOString(),
      };

      streamService.getParticipantByUserId = vi
        .fn()
        .mockResolvedValue(mockParticipant);

      // Mock Supabase delete
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
        })),
      }));
      supabase.from = mockFrom;

      await expect(
        streamService.leaveStreamEnhanced(mockStreamId, mockUserId)
      ).resolves.not.toThrow();
    });

    it("should throw error when user is not a participant", async () => {
      streamService.getParticipantByUserId = vi.fn().mockResolvedValue(null);

      await expect(
        streamService.leaveStreamEnhanced(mockStreamId, mockUserId)
      ).rejects.toThrow();
    });

    it("should validate input parameters", async () => {
      await expect(
        streamService.leaveStreamEnhanced("", mockUserId)
      ).rejects.toThrow();
      await expect(
        streamService.leaveStreamEnhanced(mockStreamId, "")
      ).rejects.toThrow();
    });
  });

  describe("toggleReminder", () => {
    it("should successfully toggle reminder setting", async () => {
      const mockParticipant: StreamParticipant = {
        id: "participant-id",
        stream_id: mockStreamId,
        user_id: mockUserId,
        joined_at: new Date().toISOString(),
        is_host: false,
        reminder_enabled: false,
        created_at: new Date().toISOString(),
      };

      streamService.getParticipantByUserId = vi
        .fn()
        .mockResolvedValue(mockParticipant);

      // Mock Supabase update
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
        })),
      }));
      supabase.from = mockFrom;

      await expect(
        streamService.toggleReminder(mockStreamId, mockUserId, true)
      ).resolves.not.toThrow();
    });

    it("should throw error when user is not a participant", async () => {
      streamService.getParticipantByUserId = vi.fn().mockResolvedValue(null);

      await expect(
        streamService.toggleReminder(mockStreamId, mockUserId, true)
      ).rejects.toThrow();
    });
  });

  describe("getParticipantsEnhanced", () => {
    it("should return participants with profile information", async () => {
      const mockParticipants = [
        {
          id: "host-id",
          stream_id: mockStreamId,
          user_id: "host-user-id",
          joined_at: new Date().toISOString(),
          is_host: true,
          reminder_enabled: true,
          created_at: new Date().toISOString(),
          user_profiles {
            display_name: "Host User",
            avatar_url: "host-avatar.jpg",
          },
        },
        {
          id: "participant-id",
          stream_id: mockStreamId,
          user_id: "participant-user-id",
          joined_at: new Date().toISOString(),
          is_host: false,
          reminder_enabled: false,
          created_at: new Date().toISOString(),
          user_profiles {
            display_name: "Participant User",
            avatar_url: "participant-avatar.jpg",
          },
        },
      ];

      // Mock Supabase select
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: mockParticipants,
                error: null,
              }),
            })),
          })),
        })),
      }));
      supabase.from = mockFrom;

      const result = await streamService.getParticipantsEnhanced(mockStreamId);

      expect(result).toHaveLength(2);
      expect(result[0].is_host).toBe(true);
      expect(result[0].profile?.display_name).toBe("Host User");
      expect(result[1].is_host).toBe(false);
      expect(result[1].profile?.display_name).toBe("Participant User");
    });

    it("should validate input parameters", async () => {
      await expect(streamService.getParticipantsEnhanced("")).rejects.toThrow();
    });
  });

  describe("isUserHost", () => {
    it("should return true when user is host", async () => {
      const mockHostParticipant: StreamParticipant = {
        id: "host-id",
        stream_id: mockStreamId,
        user_id: mockUserId,
        joined_at: new Date().toISOString(),
        is_host: true,
        reminder_enabled: false,
        created_at: new Date().toISOString(),
      };

      streamService.getParticipantByUserId = vi
        .fn()
        .mockResolvedValue(mockHostParticipant);

      const result = await streamService.isUserHost(mockStreamId, mockUserId);
      expect(result).toBe(true);
    });

    it("should return false when user is not host", async () => {
      const mockParticipant: StreamParticipant = {
        id: "participant-id",
        stream_id: mockStreamId,
        user_id: mockUserId,
        joined_at: new Date().toISOString(),
        is_host: false,
        reminder_enabled: false,
        created_at: new Date().toISOString(),
      };

      streamService.getParticipantByUserId = vi
        .fn()
        .mockResolvedValue(mockParticipant);

      const result = await streamService.isUserHost(mockStreamId, mockUserId);
      expect(result).toBe(false);
    });

    it("should return false when user is not a participant", async () => {
      streamService.getParticipantByUserId = vi.fn().mockResolvedValue(null);

      const result = await streamService.isUserHost(mockStreamId, mockUserId);
      expect(result).toBe(false);
    });
  });

  describe("subscribeToParticipantChanges", () => {
    it("should return unsubscribe function", () => {
      const mockCallback = vi.fn();

      const unsubscribe = streamService.subscribeToParticipantChanges(
        mockStreamId,
        mockCallback
      );

      expect(typeof unsubscribe).toBe("function");
    });
  });
});
