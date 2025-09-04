import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the transaction utility
vi.mock("@/utils/database-transaction", () => ({
  withTransaction: vi.fn(),
  TransactionError: class TransactionError extends Error {
    constructor(
      message: string,
      public cause?: Error,
      public rollbackSuccessful?: boolean
    ) {
      super(message);
      this.name = "TransactionError";
    }
  },
}));

// Mock the repository
vi.mock("../../data/habitats.repository", () => ({
  habitatsRepository: {
    createHabitat: vi.fn(),
    joinHabitat: vi.fn(),
    leaveHabitat: vi.fn(),
    updateMemberCount: vi.fn(),
    getHabitatById: vi.fn(),
    isUserMember: vi.fn(),
  },
}));

// Mock access control service
vi.mock("@/services/access-control.service", () => ({
  accessControlService: {
    validateAccess: vi.fn(),
    checkPermission: vi.fn(),
    isResourceOwner: vi.fn(),
  },
}));

import { HabitatsService } from "../habitats.service";
import { withTransaction } from "@/utils/database-transaction";
import { habitatsRepository } from "../../data/habitats.repository";

const mockWithTransaction = withTransaction as any;
const mockRepository = habitatsRepository as any;

describe("HabitatsService - Transaction Support", () => {
  let service: HabitatsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new HabitatsService();
  });

  describe("createHabitat with transactions", () => {
    it("should use transaction for habitat creation", async () => {
      // Arrange
      const mockHabitat = {
        id: "habitat-123",
        name: "Test Habitat",
        description: "Test Description",
        tags: ["test"],
        is_public: true,
        created_by: "user-123",
        member_count: 1,
      };

      mockWithTransaction.mockImplementation(async (operation) => {
        return await operation({
          commit: vi.fn(),
          rollback: vi.fn(),
        });
      });

      mockRepository.createHabitat.mockResolvedValue(mockHabitat);

      // Act
      const result = await service.createHabitat(
        "Test Habitat",
        "Test Description",
        ["test"],
        true,
        "user-123"
      );

      // Assert
      expect(mockWithTransaction).toHaveBeenCalledWith(expect.any(Function));
      expect(result).toEqual(mockHabitat);
    });

    it("should rollback transaction if habitat creation fails", async () => {
      // Arrange
      const error = new Error("Database error");
      mockWithTransaction.mockImplementation(async (operation) => {
        return await operation({
          commit: vi.fn(),
          rollback: vi.fn(),
        });
      });

      mockRepository.createHabitat.mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.createHabitat(
          "Test Habitat",
          "Test Description",
          ["test"],
          true,
          "user-123"
        )
      ).rejects.toThrow("Something unexpected happened");

      expect(mockWithTransaction).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("joinHabitat with transactions", () => {
    it("should use transaction for joining habitat", async () => {
      // Arrange
      const mockMember = {
        id: "member-123",
        habitat_id: "habitat-123",
        user_id: "user-123",
        joined_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
      };

      const mockHabitat = {
        id: "habitat-123",
        name: "Test Habitat",
        is_public: true,
        created_by: "other-user",
        member_count: 1,
      };

      mockWithTransaction.mockImplementation(async (operation) => {
        return await operation({
          commit: vi.fn(),
          rollback: vi.fn(),
        });
      });

      mockRepository.getHabitatById.mockResolvedValue(mockHabitat);
      mockRepository.isUserMember.mockResolvedValue(false);
      mockRepository.joinHabitat.mockResolvedValue(mockMember);

      // Act
      const result = await service.joinHabitat("habitat-123", "user-123");

      // Assert
      expect(mockWithTransaction).toHaveBeenCalledWith(expect.any(Function));
      expect(result).toEqual(mockMember);
    });

    it("should rollback transaction if member addition fails", async () => {
      // Arrange
      const mockHabitat = {
        id: "habitat-123",
        name: "Test Habitat",
        is_public: true,
        created_by: "other-user",
        member_count: 1,
      };

      const error = new Error("Member addition failed");

      mockWithTransaction.mockImplementation(async (operation) => {
        return await operation({
          commit: vi.fn(),
          rollback: vi.fn(),
        });
      });

      mockRepository.getHabitatById.mockResolvedValue(mockHabitat);
      mockRepository.isUserMember.mockResolvedValue(false);
      mockRepository.joinHabitat.mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.joinHabitat("habitat-123", "user-123")
      ).rejects.toThrow("Something unexpected happened");

      expect(mockWithTransaction).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("leaveHabitat with transactions", () => {
    it("should use transaction for leaving habitat", async () => {
      // Arrange
      const mockHabitat = {
        id: "habitat-123",
        name: "Test Habitat",
        created_by: "other-user",
        member_count: 2,
      };

      mockWithTransaction.mockImplementation(async (operation) => {
        return await operation({
          commit: vi.fn(),
          rollback: vi.fn(),
        });
      });

      mockRepository.isUserMember.mockResolvedValue(true);
      mockRepository.getHabitatById.mockResolvedValue(mockHabitat);
      mockRepository.leaveHabitat.mockResolvedValue(undefined);

      // Act
      await service.leaveHabitat("habitat-123", "user-123");

      // Assert
      expect(mockWithTransaction).toHaveBeenCalledWith(expect.any(Function));
      expect(mockRepository.leaveHabitat).toHaveBeenCalledWith(
        "habitat-123",
        "user-123"
      );
    });

    it("should rollback transaction if leaving habitat fails", async () => {
      // Arrange
      const mockHabitat = {
        id: "habitat-123",
        name: "Test Habitat",
        created_by: "other-user",
        member_count: 2,
      };

      const error = new Error("Leave habitat failed");

      mockWithTransaction.mockImplementation(async (operation) => {
        return await operation({
          commit: vi.fn(),
          rollback: vi.fn(),
        });
      });

      mockRepository.isUserMember.mockResolvedValue(true);
      mockRepository.getHabitatById.mockResolvedValue(mockHabitat);
      mockRepository.leaveHabitat.mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.leaveHabitat("habitat-123", "user-123")
      ).rejects.toThrow("Something unexpected happened");

      expect(mockWithTransaction).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
