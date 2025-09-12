import { describe, it, expect, beforeEach, vi } from "vitest";
import { StreamingRepository } from "../stream.repository";
import type { StreamParticipant } from "../../domain/stream.types";

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

describe("StreamingRepository - Participant Management", () => {
  let repository: StreamingRepository;
  const mockStreamId = "test-stream-id";
  const mockUserId = "test-user-id";

  beforeEach(() => {
    repository = new StreamingRepository();
    vi.clearAllMocks();
  });

  describe("createParticipant", () => {
    it("should create a new participant record", async () => {
      const participantData = {
        stream_id: mockStreamId,
        user_id: mockUserId,
        is_host: false,
        reminder_enabled: true,
      };

      const mockParticipant: StreamParticipant = {
        id: "participant-id",
        stream_id: mockStreamId,
        user_id: mockUserId,
        joined_at: new Date().toISOString(),
        is_host: false,
        reminder_enabled: true,
        created_at: new Date().toISOString(),
      };

      // Mock Supabase insert
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: mockParticipant,
              error: null,
            }),
          })),
        })),
      }));
      supabase.from = mockFrom;

      const result = await repository.createParticipant(participantData);

      expect(result).toEqual(mockParticipant);
      expect(supabase.from).toHaveBeenCalledWith("stream_members");
    });

    it("should throw error when creation fails", async () => {
      const participantData = {
        stream_id: mockStreamId,
        user_id: mockUserId,
        is_host: false,
        reminder_enabled: true,
      };

      // Mock Supabase error
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Creation failed" },
            }),
          })),
        })),
      }));
      supabase.from = mockFrom;

      await expect(
        repository.createParticipant(participantData)
      ).rejects.toThrow();
    });
  });

  describe("getParticipantById", () => {
    it("should return participant by ID", async () => {
      const mockParticipant: StreamParticipant = {
        id: "participant-id",
        stream_id: mockStreamId,
        user_id: mockUserId,
        joined_at: new Date().toISOString(),
        is_host: false,
        reminder_enabled: true,
        created_at: new Date().toISOString(),
      };

      // Mock Supabase select
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: mockParticipant,
              error: null,
            }),
          })),
        })),
      }));
      supabase.from = mockFrom;

      const result = await repository.getParticipantById("participant-id");

      expect(result).toEqual(mockParticipant);
    });

    it("should return null when participant not found", async () => {
      // Mock Supabase select with no data
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

  describe("updateParticipantReminder", () => {
    it("should update participant reminder setting", async () => {
      // Mock Supabase update
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              error: null,
            }),
          })),
        })),
      }));
      supabase.from = mockFrom;

      await expect(
        repository.updateParticipantReminder(mockStreamId, mockUserId, true)
      ).resolves.not.toThrow();
    });

    it("should throw error when update fails", async () => {
      // Mock Supabase error
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              error: { message: "Update failed" },
            }),
          })),
        })),
      }));
      supabase.from = mockFrom;

      await expect(
        repository.updateParticipantReminder(mockStreamId, mockUserId, true)
      ).rejects.toThrow();
    });
  });

  describe("deleteParticipant", () => {
    it("should delete participant record", async () => {
      // Mock Supabase delete
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              error: null,
            }),
          })),
        })),
      }));
      supabase.from = mockFrom;

      await expect(
        repository.deleteParticipant(mockStreamId, mockUserId)
      ).resolves.not.toThrow();
    });

    it("should throw error when deletion fails", async () => {
      // Mock Supabase error
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              error: { message: "Deletion failed" },
            }),
          })),
        })),
      }));
      supabase.from = mockFrom;

      await expect(
        repository.deleteParticipant(mockStreamId, mockUserId)
      ).rejects.toThrow();
    });
  });

  describe("getParticipantCount", () => {
    it("should return participant count for stream", async () => {
      // Mock Supabase count
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({
            count: 5,
            error: null,
          }),
        })),
      }));
      supabase.from = mockFrom;

      const result = await repository.getParticipantCount(mockStreamId);

      expect(result).toBe(5);
    });

    it("should return 0 when count query fails", async () => {
      // Mock Supabase error
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({
            count: null,
            error: { message: "Count failed" },
          }),
        })),
      }));
      supabase.from = mockFrom;

      const result = await repository.getParticipantCount(mockStreamId);

      expect(result).toBe(0);
    });
  });

  describe("getStreamHost", () => {
    it("should return host participant", async () => {
      const mockHost: StreamParticipant = {
        id: "host-id",
        stream_id: mockStreamId,
        user_id: "host-user-id",
        joined_at: new Date().toISOString(),
        is_host: true,
        reminder_enabled: false,
        created_at: new Date().toISOString(),
      };

      // Mock Supabase select
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: mockHost,
                error: null,
              }),
            })),
          })),
        })),
      }));
      supabase.from = mockFrom;

      const result = await repository.getStreamHost(mockStreamId);

      expect(result).toEqual(mockHost);
    });

    it("should return null when no host found", async () => {
      // Mock Supabase select with no data
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            })),
          })),
        })),
      }));
      supabase.from = mockFrom;

      const result = await repository.getStreamHost(mockStreamId);

      expect(result).toBeNull();
    });
  });

  describe("updateParticipantHostStatus", () => {
    it("should update participant host status", async () => {
      // Mock Supabase update
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              error: null,
            }),
          })),
        })),
      }));
      supabase.from = mockFrom;

      await expect(
        repository.updateParticipantHostStatus(mockStreamId, mockUserId, true)
      ).resolves.not.toThrow();
    });

    it("should throw error when update fails", async () => {
      // Mock Supabase error
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              error: { message: "Update failed" },
            }),
          })),
        })),
      }));
      supabase.from = mockFrom;

      await expect(
        repository.updateParticipantHostStatus(mockStreamId, mockUserId, true)
      ).rejects.toThrow();
    });
  });

  describe("getParticipantsWithProfiles", () => {
    it("should return participants with profile information", async () => {
      const mockParticipants = [
        {
          id: "participant-1",
          stream_id: mockStreamId,
          user_id: "user-1",
          joined_at: new Date().toISOString(),
          is_host: true,
          reminder_enabled: false,
          created_at: new Date().toISOString(),
          user_profiles {
            display_name: "User One",
            avatar_url: "avatar1.jpg",
          },
        },
        {
          id: "participant-2",
          stream_id: mockStreamId,
          user_id: "user-2",
          joined_at: new Date().toISOString(),
          is_host: false,
          reminder_enabled: true,
          created_at: new Date().toISOString(),
          user_profiles {
            display_name: "User Two",
            avatar_url: "avatar2.jpg",
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

      const result = await repository.getParticipantsWithProfiles(mockStreamId);

      expect(result).toHaveLength(2);
      expect(result[0].is_host).toBe(true);
      expect(result[0].profile?.display_name).toBe("User One");
      expect(result[1].is_host).toBe(false);
      expect(result[1].profile?.display_name).toBe("User Two");
    });

    it("should return empty array when no participants found", async () => {
      // Mock Supabase select with no data
      const { supabase } = await import("@/utils/supabase/client");
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            })),
          })),
        })),
      }));
      supabase.from = mockFrom;

      const result = await repository.getParticipantsWithProfiles(mockStreamId);

      expect(result).toEqual([]);
    });
  });
});
