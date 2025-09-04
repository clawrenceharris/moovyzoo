/**
 * Unit tests for AccessControlService
 * Tests permission checking, role validation, and access control logic
 */

import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { AccessControlService } from "../access-control.service";
import { Permission, Role } from "../permission-types";
// Mock the habitats repository module
vi.mock("@/features/habitats/data", () => ({
  habitatsRepository: {
    getHabitatById: vi.fn(),
    isUserMember: vi.fn(),
    getDiscussionById: vi.fn(),
    getMessageById: vi.fn(),
  },
}));

// Mock the normalize error utility
vi.mock("@/utils/normalize-error", () => ({
  normalizeError: vi.fn((error) => error),
}));

describe("AccessControlService", () => {
  let accessControlService: AccessControlService;
  // Import after mocking
  const { habitatsRepository } = await import("@/features/habitats/data");
  const mockHabitatsRepository = habitatsRepository as {
    getHabitatById: Mock;
    isUserMember: Mock;
    getDiscussionById: Mock;
    getMessageById: Mock;
  };

  beforeEach(() => {
    // Create fresh service instance for each test
    accessControlService = new AccessControlService({
      enableCaching: false, // Disable caching for tests
      enableAuditLogging: false,
    });

    // Reset all mocks
    vi.clearAllMocks();
  });

  describe("getUserRole", () => {
    it("should return OWNER role for habitat creator", async () => {
      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: "habitat-1",
        created_by: "user-1",
        is_public: true,
      });

      const role = await accessControlService.getUserRole(
        "user-1",
        "habitat-1"
      );
      expect(role).toBe(Role.OWNER);
    });

    it("should return MEMBER role for habitat member", async () => {
      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: "habitat-1",
        created_by: "user-2",
        is_public: true,
      });
      mockHabitatsRepository.isUserMember.mockResolvedValue(true);

      const role = await accessControlService.getUserRole(
        "user-1",
        "habitat-1"
      );
      expect(role).toBe(Role.MEMBER);
    });

    it("should return null for non-member", async () => {
      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: "habitat-1",
        created_by: "user-2",
        is_public: true,
      });
      mockHabitatsRepository.isUserMember.mockResolvedValue(false);

      const role = await accessControlService.getUserRole(
        "user-1",
        "habitat-1"
      );
      expect(role).toBeNull();
    });

    it("should return null for invalid inputs", async () => {
      const role1 = await accessControlService.getUserRole("", "habitat-1");
      const role2 = await accessControlService.getUserRole("user-1", "");

      expect(role1).toBeNull();
      expect(role2).toBeNull();
    });
  });

  describe("isHabitatMember", () => {
    it("should return true for habitat owner", async () => {
      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: "habitat-1",
        created_by: "user-1",
        is_public: true,
      });

      const isMember = await accessControlService.isHabitatMember(
        "user-1",
        "habitat-1"
      );
      expect(isMember).toBe(true);
    });

    it("should return true for habitat member", async () => {
      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: "habitat-1",
        created_by: "user-2",
        is_public: true,
      });
      mockHabitatsRepository.isUserMember.mockResolvedValue(true);

      const isMember = await accessControlService.isHabitatMember(
        "user-1",
        "habitat-1"
      );
      expect(isMember).toBe(true);
    });

    it("should return false for non-member", async () => {
      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: "habitat-1",
        created_by: "user-2",
        is_public: true,
      });
      mockHabitatsRepository.isUserMember.mockResolvedValue(false);

      const isMember = await accessControlService.isHabitatMember(
        "user-1",
        "habitat-1"
      );
      expect(isMember).toBe(false);
    });
  });

  describe("isResourceOwner", () => {
    it("should return true for habitat owner", async () => {
      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: "habitat-1",
        created_by: "user-1",
      });

      const isOwner = await accessControlService.isResourceOwner(
        "user-1",
        "habitat-1",
        "habitat"
      );
      expect(isOwner).toBe(true);
    });

    it("should return true for message author", async () => {
      mockHabitatsRepository.getMessageById.mockResolvedValue({
        id: "message-1",
        user_id: "user-1",
        habitat_id: "habitat-1",
      });

      const isOwner = await accessControlService.isResourceOwner(
        "user-1",
        "message-1",
        "message"
      );
      expect(isOwner).toBe(true);
    });

    it("should return true for discussion creator", async () => {
      mockHabitatsRepository.getDiscussionById.mockResolvedValue({
        id: "discussion-1",
        created_by: "user-1",
        habitat_id: "habitat-1",
      });

      const isOwner = await accessControlService.isResourceOwner(
        "user-1",
        "discussion-1",
        "discussion"
      );
      expect(isOwner).toBe(true);
    });

    it("should return false for non-owner", async () => {
      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: "habitat-1",
        created_by: "user-2",
      });

      const isOwner = await accessControlService.isResourceOwner(
        "user-1",
        "habitat-1",
        "habitat"
      );
      expect(isOwner).toBe(false);
    });
  });

  describe("checkPermission", () => {
    it("should grant READ_HABITAT permission for public habitat", async () => {
      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: "habitat-1",
        created_by: "user-2",
        is_public: true,
      });
      mockHabitatsRepository.isUserMember.mockResolvedValue(false);

      const hasPermission = await accessControlService.checkPermission(
        "user-1",
        "habitat-1",
        Permission.READ_HABITAT,
        "habitat"
      );

      expect(hasPermission).toBe(true);
    });

    it("should grant permission for habitat owner", async () => {
      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: "habitat-1",
        created_by: "user-1",
        is_public: false,
      });

      const hasPermission = await accessControlService.checkPermission(
        "user-1",
        "habitat-1",
        Permission.MANAGE_HABITAT,
        "habitat"
      );

      expect(hasPermission).toBe(true);
    });

    it("should grant permission for habitat member with role", async () => {
      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: "habitat-1",
        created_by: "user-2",
        is_public: false,
      });
      mockHabitatsRepository.isUserMember.mockResolvedValue(true);

      const hasPermission = await accessControlService.checkPermission(
        "user-1",
        "habitat-1",
        Permission.SEND_MESSAGE,
        "habitat"
      );

      expect(hasPermission).toBe(true);
    });

    it("should deny permission for non-member of private habitat", async () => {
      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: "habitat-1",
        created_by: "user-2",
        is_public: false,
      });
      mockHabitatsRepository.isUserMember.mockResolvedValue(false);

      const hasPermission = await accessControlService.checkPermission(
        "user-1",
        "habitat-1",
        Permission.SEND_MESSAGE,
        "habitat"
      );

      expect(hasPermission).toBe(false);
    });

    it("should grant DELETE_MESSAGE permission for message author", async () => {
      // Setup message ownership
      mockHabitatsRepository.getMessageById.mockResolvedValue({
        id: "message-1",
        user_id: "user-1",
        habitat_id: "habitat-1",
      });

      // Setup habitat membership
      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: "habitat-1",
        created_by: "user-2",
        is_public: false,
      });
      mockHabitatsRepository.isUserMember.mockResolvedValue(true);

      const hasPermission = await accessControlService.checkPermission(
        "user-1",
        "message-1",
        Permission.DELETE_MESSAGE,
        "message"
      );

      expect(hasPermission).toBe(true);
    });

    it("should return false for invalid inputs", async () => {
      const hasPermission1 = await accessControlService.checkPermission(
        "",
        "habitat-1",
        Permission.READ_HABITAT
      );
      const hasPermission2 = await accessControlService.checkPermission(
        "user-1",
        "",
        Permission.READ_HABITAT
      );

      expect(hasPermission1).toBe(false);
      expect(hasPermission2).toBe(false);
    });
  });

  describe("hasAnyPermission", () => {
    it("should return true if user has any of the specified permissions", async () => {
      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: "habitat-1",
        created_by: "user-2",
        is_public: true,
      });
      mockHabitatsRepository.isUserMember.mockResolvedValue(false);

      const hasAny = await accessControlService.hasAnyPermission(
        "user-1",
        "habitat-1",
        [Permission.MANAGE_HABITAT, Permission.READ_HABITAT],
        "habitat"
      );

      expect(hasAny).toBe(true); // Should have READ_HABITAT for public habitat
    });

    it("should return false if user has none of the specified permissions", async () => {
      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: "habitat-1",
        created_by: "user-2",
        is_public: false,
      });
      mockHabitatsRepository.isUserMember.mockResolvedValue(false);

      const hasAny = await accessControlService.hasAnyPermission(
        "user-1",
        "habitat-1",
        [Permission.MANAGE_HABITAT, Permission.SEND_MESSAGE],
        "habitat"
      );

      expect(hasAny).toBe(false);
    });
  });

  describe("validateAccess", () => {
    it("should not throw for valid access", async () => {
      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: "habitat-1",
        created_by: "user-2",
        is_public: true,
      });
      mockHabitatsRepository.isUserMember.mockResolvedValue(false);

      await expect(
        accessControlService.validateAccess(
          "user-1",
          "habitat-1",
          Permission.READ_HABITAT,
          "habitat"
        )
      ).resolves.not.toThrow();
    });

    it("should throw for invalid access", async () => {
      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: "habitat-1",
        created_by: "user-2",
        is_public: false,
      });
      mockHabitatsRepository.isUserMember.mockResolvedValue(false);

      await expect(
        accessControlService.validateAccess(
          "user-1",
          "habitat-1",
          Permission.SEND_MESSAGE,
          "habitat"
        )
      ).rejects.toThrow();
    });
  });

  describe("getPermissionResult", () => {
    it("should return detailed permission result", async () => {
      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: "habitat-1",
        created_by: "user-1",
        is_public: false,
      });

      const result = await accessControlService.getPermissionResult(
        "user-1",
        "habitat-1",
        Permission.MANAGE_HABITAT,
        "habitat"
      );

      expect(result.granted).toBe(true);
      expect(result.reason).toContain("Role owner has permission");
    });

    it("should return denial reason for insufficient permissions", async () => {
      mockHabitatsRepository.getHabitatById.mockResolvedValue({
        id: "habitat-1",
        created_by: "user-2",
        is_public: false,
      });
      mockHabitatsRepository.isUserMember.mockResolvedValue(false);

      const result = await accessControlService.getPermissionResult(
        "user-1",
        "habitat-1",
        Permission.SEND_MESSAGE,
        "habitat"
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain("not a member");
    });
  });
});
