import { describe, it, expect, vi, beforeEach } from "vitest";
import { StreamService } from "../domain/stream.service";
import { StreamingRepository } from "../data/stream.repository";
import type { StreamWithParticipants } from "../domain/stream.types";
import { AppErrorCode } from "@/utils/error-codes";
import { normalizeError } from "@/utils/normalize-error";
import { Mocked } from "vitest";

// Mock Supabase client
vi.mock("@/utils/supabase/client", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
  })),
}));

// Mock the repository
vi.mock("../data/streams.repository");

describe("StreamService", () => {
  let service: StreamService;
  let mockRepository: Mocked<StreamingRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new StreamService();
    mockRepository = vi.mocked(new StreamingRepository());
    // Replace the private repository instance
    (service as any).repository = mockRepository;
  });

  describe("getStreamDashboard", () => {
    it("should return dashboard data when streaming session exists", async () => {
      const mockStream: StreamWithParticipants = {
        id: "test-id",
        habitat_id: "habitat-1",
        scheduled_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        participant_count: 2,
        created_by: "user-1",
        created_at: "2024-11-01T10:00:00Z",
        is_active: true,
        media_title: "Test Movie",
        participants: [],
        is_participant: false,
        max_participants: 0,
      };

      const mockParticipants = [
        {
          stream_id: "test-id",
          user_id: "user-1",
          joined_at: "2024-11-01T10:00:00Z",
          is_active: true,
        },
      ];

      mockRepository.getStreamById.mockResolvedValue(mockStream);
      mockRepository.getStreamParticipants.mockResolvedValue(mockParticipants);
      mockRepository.isUserParticipant.mockResolvedValue(false);

      const result = await service.getStreamingDashboard("test-id", "user-2");

      expect(result).toBeDefined();
      expect(result?.stream.id).toBe("test-id");
      expect(result?.participants).toEqual(mockParticipants);
      expect(result?.userParticipation.isParticipant).toBe(false);
      expect(result?.canJoin).toBe(true);
      expect(result?.canLeave).toBe(false);
    });

    it("should return null when streaming session does not exist", async () => {
      mockRepository.getStreamById.mockResolvedValue(null);

      const result = await service.getStreamingDashboard(
        "non-existent",
        "user-1"
      );

      expect(result).toBeNull();
    });

    it("should handle repository errors gracefully", async () => {
      mockRepository.getStreamById.mockRejectedValue(
        new Error("Database error")
      );

      const result = await service.getStreamingDashboard("test-id", "user-1");

      expect(result).toBeNull();
    });
  });

  describe("joinStream", () => {
    it("should throw error for invalid streaming session ID", async () => {
      await expect(service.joinStream("", "user-1")).rejects.toThrow();
      await expect(service.joinStream(null as any, "user-1")).rejects.toThrow();
    });

    it("should throw error for invalid user ID", async () => {
      await expect(service.joinStream("test-id", "")).rejects.toThrow();
      await expect(
        service.joinStream("test-id", null as any)
      ).rejects.toThrow();
    });

    it("should successfully join a streaming session", async () => {
      const mockStream: StreamWithParticipants = {
        id: "test-id",
        habitat_id: "habitat-1",
        scheduled_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        participant_count: 1,
        created_by: "user-1",
        created_at: "2024-11-01T10:00:00Z",
        is_active: true,
        participants: [],
        is_participant: false,
        max_participants: 0,
      };

      mockRepository.getStreamById.mockResolvedValue(mockStream);
      mockRepository.isUserParticipant.mockResolvedValue(false);
      mockRepository.joinStream.mockResolvedValue(true);

      await expect(
        service.joinStream("test-id", "user-2")
      ).resolves.not.toThrow();
      expect(mockRepository.joinStream).toHaveBeenCalledWith(
        "test-id",
        "user-2"
      );
    });

    it("should throw WATCH_PARTY_NOT_FOUND when streaming session does not exist", async () => {
      mockRepository.getStreamById.mockResolvedValue(null);

      await expect(
        service.joinStream("non-existent", "user-1")
      ).rejects.toThrow();

      try {
        await service.joinStream("non-existent", "user-1");
      } catch (error) {
        const normalizedError = normalizeError(error);
        expect(normalizedError.code).toBe(AppErrorCode.WATCH_PARTY_NOT_FOUND);
      }
    });

    it("should throw ALREADY_PARTICIPANT when user is already a participant", async () => {
      const mockStream: StreamWithParticipants = {
        id: "test-id",
        habitat_id: "habitat-1",
        scheduled_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        participant_count: 1,
        created_by: "user-1",
        created_at: "2024-11-01T10:00:00Z",
        is_active: true,
        participants: [],
        is_participant: false,
        max_participants: 0,
      };

      mockRepository.getStreamById.mockResolvedValue(mockStream);
      mockRepository.isUserParticipant.mockResolvedValue(true);

      await expect(service.joinStream("test-id", "user-1")).rejects.toThrow();

      try {
        await service.joinStream("test-id", "user-1");
      } catch (error) {
        const normalizedError = normalizeError(error);
        expect(normalizedError.code).toBe(AppErrorCode.ALREADY_PARTICIPANT);
      }

      expect(mockRepository.joinStream).not.toHaveBeenCalled();
    });

    it("should throw WATCH_PARTY_FULL when streaming session is at capacity", async () => {
      const mockStream: StreamWithParticipants = {
        id: "test-id",
        habitat_id: "habitat-1",
        scheduled_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        participant_count: 5,
        max_participants: 5,
        created_by: "user-1",
        created_at: "2024-11-01T10:00:00Z",
        is_active: true,
        participants: [],
        is_participant: false,
      };

      mockRepository.getStreamById.mockResolvedValue(mockStream);
      mockRepository.isUserParticipant.mockResolvedValue(false);

      await expect(service.joinStream("test-id", "user-2")).rejects.toThrow();

      try {
        await service.joinStream("test-id", "user-2");
      } catch (error) {
        const normalizedError = normalizeError(error);
        expect(normalizedError.code).toBe(AppErrorCode.WATCH_PARTY_FULL);
      }
    });
  });

  describe("leaveStream", () => {
    it("should throw error for invalid streaming session ID", async () => {
      await expect(service.leaveStream("", "user-1")).rejects.toThrow();
      await expect(
        service.leaveStream(null as any, "user-1")
      ).rejects.toThrow();
    });

    it("should throw error for invalid user ID", async () => {
      await expect(service.leaveStream("test-id", "")).rejects.toThrow();
      await expect(
        service.leaveStream("test-id", null as any)
      ).rejects.toThrow();
    });

    it("should successfully leave a streaming session", async () => {
      mockRepository.isUserParticipant.mockResolvedValue(true);
      mockRepository.leaveStream.mockResolvedValue(true);

      await expect(
        service.leaveStream("test-id", "user-1")
      ).resolves.not.toThrow();
      expect(mockRepository.leaveStream).toHaveBeenCalledWith(
        "test-id",
        "user-1"
      );
    });

    it("should throw NOT_PARTICIPANT when user is not a participant", async () => {
      mockRepository.isUserParticipant.mockResolvedValue(false);

      await expect(service.leaveStream("test-id", "user-1")).rejects.toThrow();

      try {
        await service.leaveStream("test-id", "user-1");
      } catch (error) {
        const normalizedError = normalizeError(error);
        expect(normalizedError.code).toBe(AppErrorCode.NOT_PARTICIPANT);
      }

      expect(mockRepository.leaveStream).not.toHaveBeenCalled();
    });
  });

  describe("getStream", () => {
    it("should throw error for invalid streaming session ID", async () => {
      await expect(service.getStream("")).rejects.toThrow();
      await expect(service.getStream(null as any)).rejects.toThrow();
      await expect(service.getStream(undefined as any)).rejects.toThrow();
    });

    it("should return streaming session with media and participation data", async () => {
      const mockStream: StreamWithParticipants = {
        id: "test-id",
        habitat_id: "habitat-1",
        scheduled_time: "2024-12-01T20:00:00Z",
        participant_count: 2,
        created_by: "user-1",
        created_at: "2024-11-01T10:00:00Z",
        is_active: true,
        media_title: "Test Movie",
        tmdb_id: 12345,
        media_type: "movie",
        poster_path: "/test-poster.jpg",
        participants: [],
        is_participant: false,
        max_participants: 0,
      };

      mockRepository.getStreamById.mockResolvedValue(mockStream);

      const result = await service.getStream("test-id");

      expect(result).toBeDefined();
      expect(result?.id).toBe("test-id");
      expect(result?.media_title).toBe("Test Movie");
      expect(result?.tmdb_id).toBe(12345);
      expect(mockRepository.getStreamById).toHaveBeenCalledWith("test-id");
    });

    it("should throw WATCH_PARTY_NOT_FOUND when streaming session does not exist", async () => {
      mockRepository.getStreamById.mockResolvedValue(null);

      await expect(service.getStream("non-existent")).rejects.toThrow();

      try {
        await service.getStream("non-existent");
      } catch (error) {
        const normalizedError = normalizeError(error);
        expect(normalizedError.code).toBe(AppErrorCode.WATCH_PARTY_NOT_FOUND);
      }
    });

    it("should handle repository errors and normalize them", async () => {
      mockRepository.getStreamById.mockRejectedValue(
        new Error("Database error")
      );

      await expect(service.getStream("test-id")).rejects.toThrow();
    });
  });

  describe("getParticipants", () => {
    it("should throw error for invalid streaming session ID", async () => {
      await expect(service.getParticipants("")).rejects.toThrow();
      await expect(service.getParticipants(null as any)).rejects.toThrow();
    });

    it("should return participant list with profile information", async () => {
      const mockParticipants = [
        {
          stream_id: "test-id",
          user_id: "user-1",
          joined_at: "2024-11-01T10:00:00Z",
          is_active: true,
        },
        {
          stream_id: "test-id",
          user_id: "user-2",
          joined_at: "2024-11-01T11:00:00Z",
          is_active: true,
        },
      ];

      mockRepository.getStreamParticipants.mockResolvedValue(mockParticipants);

      const result = await service.getParticipants("test-id");

      expect(result).toEqual(mockParticipants);
      expect(mockRepository.getStreamParticipants).toHaveBeenCalledWith(
        "test-id"
      );
    });

    it("should return empty array when no participants", async () => {
      mockRepository.getStreamParticipants.mockResolvedValue([]);

      const result = await service.getParticipants("test-id");

      expect(result).toEqual([]);
    });

    it("should handle repository errors and normalize them", async () => {
      mockRepository.getStreamParticipants.mockRejectedValue(
        new Error("Database error")
      );

      await expect(service.getParticipants("test-id")).rejects.toThrow();
    });
  });

  describe("checkUserParticipation", () => {
    it("should throw error for invalid streaming session ID", async () => {
      await expect(
        service.checkUserParticipation("", "user-1")
      ).rejects.toThrow();
      await expect(
        service.checkUserParticipation(null as any, "user-1")
      ).rejects.toThrow();
    });

    it("should throw error for invalid user ID", async () => {
      await expect(
        service.checkUserParticipation("test-id", "")
      ).rejects.toThrow();
      await expect(
        service.checkUserParticipation("test-id", null as any)
      ).rejects.toThrow();
    });

    it("should return participation status for non-participant user", async () => {
      const mockStream: StreamWithParticipants = {
        id: "test-id",
        habitat_id: "habitat-1",
        scheduled_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        participant_count: 1,
        created_by: "user-1",
        created_at: "2024-11-01T10:00:00Z",
        is_active: true,
        participants: [],
        is_participant: false,
        max_participants: 0,
      };

      mockRepository.getStreamById.mockResolvedValue(mockStream);
      mockRepository.isUserParticipant.mockResolvedValue(false);

      const result = await service.checkUserParticipation("test-id", "user-2");

      expect(result).toBeDefined();
      expect(result?.isParticipant).toBe(false);
      expect(result?.canJoin).toBe(true);
      expect(result?.canLeave).toBe(false);
      expect(result?.joinedAt).toBeUndefined();
    });

    it("should return participation status for participant user", async () => {
      const mockStream: StreamWithParticipants = {
        id: "test-id",
        habitat_id: "habitat-1",
        scheduled_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        participant_count: 2,
        created_by: "user-1",
        created_at: "2024-11-01T10:00:00Z",
        is_active: true,
        participants: [],
        is_participant: false,
        max_participants: 0,
      };

      const mockParticipants = [
        {
          stream_id: "test-id",
          user_id: "user-2",
          joined_at: "2024-11-01T10:00:00Z",
          is_active: true,
        },
      ];

      mockRepository.getStreamById.mockResolvedValue(mockStream);
      mockRepository.isUserParticipant.mockResolvedValue(true);
      mockRepository.getStreamParticipants.mockResolvedValue(mockParticipants);

      const result = await service.checkUserParticipation("test-id", "user-2");

      expect(result).toBeDefined();
      expect(result?.isParticipant).toBe(true);
      expect(result?.canJoin).toBe(false);
      expect(result?.canLeave).toBe(true);
      expect(result?.joinedAt).toEqual(new Date("2024-11-01T10:00:00Z"));
    });

    it("should throw WATCH_PARTY_NOT_FOUND when streaming session does not exist", async () => {
      mockRepository.getStreamById.mockResolvedValue(null);

      await expect(
        service.checkUserParticipation("non-existent", "user-1")
      ).rejects.toThrow();

      try {
        await service.checkUserParticipation("non-existent", "user-1");
      } catch (error) {
        const normalizedError = normalizeError(error);
        expect(normalizedError.code).toBe(AppErrorCode.WATCH_PARTY_NOT_FOUND);
      }
    });

    it("should handle repository errors and normalize them", async () => {
      mockRepository.getStreamById.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        service.checkUserParticipation("test-id", "user-1")
      ).rejects.toThrow();
    });
  });

  describe("getStreamStatus", () => {
    it("should return 'upcoming' for future streaming sessions", () => {
      const futureTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
      const mockStream: StreamWithParticipants = {
        id: "test-id",
        habitat_id: "habitat-1",
        scheduled_time: futureTime.toISOString(),
        participant_count: 1,
        created_by: "user-1",
        created_at: "2024-11-01T10:00:00Z",
        is_active: true,
        participants: [],
        is_participant: false,
        max_participants: 0,
      };

      const status = service.getStreamStatus(mockStream);

      expect(status.status).toBe("upcoming");
      expect(status.timeUntilStart).toBeGreaterThan(30);
    });

    it("should return 'live' for current streaming sessions", () => {
      const currentTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
      const mockStream: StreamWithParticipants = {
        id: "test-id",
        habitat_id: "habitat-1",
        scheduled_time: currentTime.toISOString(),
        participant_count: 1,
        created_by: "user-1",
        created_at: "2024-11-01T10:00:00Z",
        is_active: true,
        participants: [],
        is_participant: false,
        max_participants: 0,
      };

      const status = service.getStreamStatus(mockStream);

      expect(status.status).toBe("live");
    });

    it("should return 'ended' for past streaming sessions", () => {
      const pastTime = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      const mockStream: StreamWithParticipants = {
        id: "test-id",
        habitat_id: "habitat-1",
        scheduled_time: pastTime.toISOString(),
        participant_count: 1,
        created_by: "user-1",
        created_at: "2024-11-01T10:00:00Z",
        is_active: true,
        participants: [],
        is_participant: false,
        max_participants: 0,
      };

      const status = service.getStreamStatus(mockStream);

      expect(status.status).toBe("ended");
    });
  });
});
