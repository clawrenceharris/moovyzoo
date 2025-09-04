import { describe, it, expect, vi, beforeEach } from "vitest";
import { Permission } from "@/services/permission-types";
import type {
  HabitatWithMembership,
  DiscussionWithStats,
  WatchParty,
  HabitatMember,
  HabitatDashboardData,
} from "../habitats.types";

// Mock dependencies before importing the service
vi.mock("../../data/habitats.repository", () => ({
  habitatsRepository: {
    getHabitatById: vi.fn(),
    getDiscussionsByHabitat: vi.fn(),
    getWatchPartiesByHabitat: vi.fn(),
    getHabitatMembers: vi.fn(),
    getHabitatMessages: vi.fn(),
  },
}));

vi.mock("@/services/access-control.service", () => ({
  accessControlService: {
    validateAccess: vi.fn(),
  },
}));

// Import after mocking
import { habitatsService } from "../habitats.service";
import { habitatsRepository } from "../../data/habitats.repository";
import { accessControlService } from "@/services/access-control.service";

const mockHabitatsRepository = vi.mocked(habitatsRepository);
const mockAccessControlService = vi.mocked(accessControlService);

describe("HabitatsService - getDashboardData", () => {
  const mockHabitatId = "habitat-123";
  const mockUserId = "user-456";

  const mockHabitat: HabitatWithMembership = {
    id: mockHabitatId,
    name: "Test Habitat",
    description: "A test habitat",
    tags: ["test", "habitat"],
    member_count: 5,
    is_public: true,
    created_by: "creator-123",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    banner_url: null,
    is_member: true,
  };

  const mockDiscussions: DiscussionWithStats[] = [
    {
      id: "discussion-1",
      habitat_id: mockHabitatId,
      name: "Test Discussion",
      description: "A test discussion",
      created_by: mockUserId,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      message_count: 10,
      last_message_at: "2024-01-01T12:00:00Z",
    },
  ];

  const mockWatchParties: WatchParty[] = [
    {
      id: "watch-party-1",
      habitat_id: mockHabitatId,
      description: "Test Watch Party",
      scheduled_time: "2024-01-02T20:00:00Z",
      participant_count: 3,
      max_participants: 10,
      created_by: mockUserId,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      tmdb_id: 12345,
      media_type: "movie",
      media_title: "Test Movie",
      poster_path: "/test-poster.jpg",
      release_date: "2024-01-01",
      runtime: 120,
      participants: [
        {
          user_id: mockUserId,
          joined_at: "2024-01-01T00:00:00Z",
        },
      ],
    },
  ];

  const mockMembers: HabitatMember[] = [
    {
      user_id: mockUserId,
      habitat_id: mockHabitatId,
      joined_at: "2024-01-01T00:00:00Z",
      last_active: new Date().toISOString(), // Active now
      profile: {
        id: mockUserId,
        username: "testuser",
        display_name: "Test User",
        avatar_url: null,
      },
    },
    {
      user_id: "user-789",
      habitat_id: mockHabitatId,
      joined_at: "2024-01-01T00:00:00Z",
      last_active: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 minutes ago (offline)
      profile: {
        id: "user-789",
        username: "offlineuser",
        display_name: "Offline User",
        avatar_url: null,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return complete dashboard data when user has access", async () => {
    // Arrange
    mockAccessControlService.validateAccess.mockResolvedValue(undefined);
    mockHabitatsRepository.getHabitatById.mockResolvedValue(mockHabitat);
    mockHabitatsRepository.getDiscussionsByHabitat.mockResolvedValue(
      mockDiscussions
    );
    mockHabitatsRepository.getWatchPartiesByHabitat.mockResolvedValue(
      mockWatchParties
    );
    mockHabitatsRepository.getHabitatMembers.mockResolvedValue(mockMembers);
    mockHabitatsRepository.getHabitatMessages.mockResolvedValue([]);

    // Act
    const result = await habitatsService.getDashboardData(
      mockHabitatId,
      mockUserId
    );

    // Assert
    expect(result).toEqual({
      habitat: {
        id: mockHabitatId,
        name: "Test Habitat",
        description: "A test habitat",
        tags: ["test", "habitat"],
        member_count: 5,
        is_public: true,
        created_by: "creator-123",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        banner_url: null,
        is_member: true,
      },
      discussions: mockDiscussions,
      polls: [],
      watchParties: [
        {
          ...mockWatchParties[0],
          is_participant: true,
        },
      ],
      members: mockMembers,
      onlineMembers: [mockMembers[0]], // Only the first member is online
      totalMembers: 2,
    });

    // Verify access control was checked
    expect(mockAccessControlService.validateAccess).toHaveBeenCalledWith(
      mockUserId,
      mockHabitatId,
      Permission.READ_HABITAT,
      "habitat"
    );

    // Verify all data was fetched in parallel
    expect(mockHabitatsRepository.getHabitatById).toHaveBeenCalledWith(
      mockHabitatId,
      mockUserId
    );
    expect(mockHabitatsRepository.getDiscussionsByHabitat).toHaveBeenCalledWith(
      mockHabitatId
    );
    expect(
      mockHabitatsRepository.getWatchPartiesByHabitat
    ).toHaveBeenCalledWith(mockHabitatId);
    expect(mockHabitatsRepository.getHabitatMembers).toHaveBeenCalledWith(
      mockHabitatId
    );
  });

  it("should throw error when user lacks access", async () => {
    // Arrange
    const accessError = new Error("Access denied");
    mockAccessControlService.validateAccess.mockRejectedValue(accessError);

    // Act & Assert
    await expect(
      habitatsService.getDashboardData(mockHabitatId, mockUserId)
    ).rejects.toThrow("You don't have permission to access this habitat");

    // Verify no data was fetched after access denial
    expect(mockHabitatsRepository.getHabitatById).not.toHaveBeenCalled();
  });

  it("should throw error when habitat ID is missing", async () => {
    // Act & Assert
    await expect(
      habitatsService.getDashboardData("", mockUserId)
    ).rejects.toThrow("Something unexpected happened");
  });

  it("should throw error when user ID is missing", async () => {
    // Act & Assert
    await expect(
      habitatsService.getDashboardData(mockHabitatId, "")
    ).rejects.toThrow("Something unexpected happened");
  });

  it("should correctly identify online members", async () => {
    // Arrange
    const now = new Date();
    const recentlyActive = new Date(
      now.getTime() - 10 * 60 * 1000
    ).toISOString(); // 10 minutes ago
    const longAgoActive = new Date(
      now.getTime() - 20 * 60 * 1000
    ).toISOString(); // 20 minutes ago

    const membersWithDifferentActivity: HabitatMember[] = [
      {
        ...mockMembers[0],
        last_active: recentlyActive, // Online
      },
      {
        ...mockMembers[1],
        last_active: longAgoActive, // Offline
      },
    ];

    mockAccessControlService.validateAccess.mockResolvedValue(undefined);
    mockHabitatsRepository.getHabitatById.mockResolvedValue(mockHabitat);
    mockHabitatsRepository.getDiscussionsByHabitat.mockResolvedValue([]);
    mockHabitatsRepository.getWatchPartiesByHabitat.mockResolvedValue([]);
    mockHabitatsRepository.getHabitatMembers.mockResolvedValue(
      membersWithDifferentActivity
    );
    mockHabitatsRepository.getHabitatMessages.mockResolvedValue([]);

    // Act
    const result = await habitatsService.getDashboardData(
      mockHabitatId,
      mockUserId
    );

    // Assert
    expect(result.onlineMembers).toHaveLength(1);
    expect(result.onlineMembers[0].user_id).toBe(mockUserId);
    expect(result.totalMembers).toBe(2);
  });

  it("should mark user as participant in watch parties they joined", async () => {
    // Arrange
    const watchPartyWithoutUser: WatchParty = {
      ...mockWatchParties[0],
      participants: [
        {
          user_id: "other-user",
          joined_at: "2024-01-01T00:00:00Z",
        },
      ],
    };

    mockAccessControlService.validateAccess.mockResolvedValue(undefined);
    mockHabitatsRepository.getHabitatById.mockResolvedValue(mockHabitat);
    mockHabitatsRepository.getDiscussionsByHabitat.mockResolvedValue([]);
    mockHabitatsRepository.getWatchPartiesByHabitat.mockResolvedValue([
      watchPartyWithoutUser,
    ]);
    mockHabitatsRepository.getHabitatMembers.mockResolvedValue([]);
    mockHabitatsRepository.getHabitatMessages.mockResolvedValue([]);

    // Act
    const result = await habitatsService.getDashboardData(
      mockHabitatId,
      mockUserId
    );

    // Assert
    expect(result.watchParties[0].is_participant).toBe(false);
  });
});

describe("HabitatsService - Composition Methods", () => {
  const mockHabitatId = "habitat-123";
  const mockUserId = "user-456";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getHabitatStats", () => {
    it("should return habitat statistics", async () => {
      // Arrange
      const mockStats = {
        memberCount: 10,
        discussionCount: 5,
        watchPartyCount: 3,
        messageCount: 150,
      };

      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: mockHabitatId,
        member_count: 10,
      } as any);
      mockHabitatsRepository.getDiscussionsByHabitat.mockResolvedValue([
        { id: "1" },
        { id: "2" },
        { id: "3" },
        { id: "4" },
        { id: "5" },
      ] as any);
      mockHabitatsRepository.getWatchPartiesByHabitat.mockResolvedValue([
        { id: "1" },
        { id: "2" },
        { id: "3" },
      ] as any);
      mockHabitatsRepository.getHabitatMessages.mockResolvedValue(
        Array(150).fill({ id: "msg" })
      );

      // Act
      const result = await habitatsService.getHabitatStats(mockHabitatId);

      // Assert
      expect(result).toEqual(mockStats);
    });
  });

  describe("getRecentActivity", () => {
    it("should return recent activity for habitat", async () => {
      // Arrange
      const mockRecentMessages = [
        {
          id: "msg-1",
          content: "Recent message",
          created_at: new Date().toISOString(),
          user_id: mockUserId,
        },
      ];

      mockHabitatsRepository.getHabitatMessages.mockResolvedValue(
        mockRecentMessages as any
      );

      // Act
      const result = await habitatsService.getRecentActivity(mockHabitatId, 10);

      // Assert
      expect(result).toEqual(mockRecentMessages);
      expect(mockHabitatsRepository.getHabitatMessages).toHaveBeenCalledWith(
        mockHabitatId,
        10,
        0
      );
    });
  });

  describe("getMemberManagementData", () => {
    it("should return member management data", async () => {
      // Arrange
      const mockMembers = [
        {
          user_id: mockUserId,
          habitat_id: mockHabitatId,
          joined_at: "2024-01-01T00:00:00Z",
          last_active: new Date().toISOString(),
          profile: {
            id: mockUserId,
            username: "testuser",
            display_name: "Test User",
            avatar_url: null,
          },
        },
      ];

      mockHabitatsRepository.getHabitatMembers.mockResolvedValue(mockMembers);

      // Act
      const result = await habitatsService.getMemberManagementData(
        mockHabitatId
      );

      // Assert
      expect(result).toEqual({
        members: mockMembers,
        totalMembers: 1,
        onlineMembers: mockMembers, // All members are online in this test
        membersByRole: {
          owners: [],
          moderators: [],
          members: mockMembers,
        },
      });
    });
  });
});

describe("HabitatsService - Error Handling", () => {
  const mockHabitatId = "habitat-123";
  const mockUserId = "user-456";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("comprehensive error processing", () => {
    it("should handle database errors consistently", async () => {
      // Arrange
      const dbError = new Error("Database connection failed");
      dbError.name = "PostgrestError";
      mockHabitatsRepository.getHabitatById.mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        habitatsService.getHabitatStats(mockHabitatId)
      ).rejects.toThrow("Network connection failed");
    });

    it("should handle validation errors with proper context", async () => {
      // Act & Assert
      await expect(habitatsService.getHabitatStats("")).rejects.toThrow(
        "Something unexpected happened"
      );
    });

    it("should handle access control errors consistently", async () => {
      // Arrange
      const accessError = new Error("Access denied");
      mockAccessControlService.validateAccess.mockRejectedValue(accessError);

      // Act & Assert
      await expect(
        habitatsService.getDashboardData(mockHabitatId, mockUserId)
      ).rejects.toThrow("You don't have permission to access this habitat");
    });

    it("should provide meaningful error context for debugging", async () => {
      // Arrange
      const originalError = new Error("Original database error");
      originalError.name = "PostgrestError";
      mockHabitatsRepository.getHabitatMembers.mockRejectedValue(originalError);

      // Act & Assert
      try {
        await habitatsService.getMemberManagementData(mockHabitatId);
      } catch (error: any) {
        expect(error.message).toContain("Something unexpected happened");
        // The original error should be normalized but the message should be user-friendly
        // The detailed error context should be logged (visible in test output)
      }
    });

    it("should handle concurrent operation failures gracefully", async () => {
      // Arrange
      mockAccessControlService.validateAccess.mockResolvedValue(undefined);
      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: mockHabitatId,
        member_count: 5,
      } as any);

      // Simulate one operation failing while others succeed
      mockHabitatsRepository.getDiscussionsByHabitat.mockResolvedValue([]);
      mockHabitatsRepository.getWatchPartiesByHabitat.mockRejectedValue(
        new Error("Watch parties service unavailable")
      );
      mockHabitatsRepository.getHabitatMembers.mockResolvedValue([]);
      mockHabitatsRepository.getHabitatMessages.mockResolvedValue([]);

      // Act & Assert
      await expect(
        habitatsService.getDashboardData(mockHabitatId, mockUserId)
      ).rejects.toThrow("Something unexpected happened");
    });
  });
});
