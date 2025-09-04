/**
 * Unit tests for role definitions and permission mappings
 * Tests the role hierarchy and permission checking logic
 */

import { describe, it, expect } from "vitest";
import {
  getRolePermissions,
  roleHasPermission,
  isRoleHigherThan,
  getMinimumRoleForPermission,
  checkSpecialPermissionRule,
} from "../role-definitions";
import { Role, Permission } from "../permission-types";

describe("Role Definitions", () => {
  describe("getRolePermissions", () => {
    it("should return correct permissions for MEMBER role", () => {
      const permissions = getRolePermissions(Role.MEMBER);

      expect(permissions).toContain(Permission.READ_HABITAT);
      expect(permissions).toContain(Permission.SEND_MESSAGE);
      expect(permissions).toContain(Permission.CREATE_DISCUSSION);
      expect(permissions).toContain(Permission.CREATE_POLL);
      expect(permissions).toContain(Permission.VOTE_POLL);
      expect(permissions).toContain(Permission.CREATE_WATCH_PARTY);
      expect(permissions).toContain(Permission.JOIN_WATCH_PARTY);
    });

    it("should return correct permissions for OWNER role", () => {
      const permissions = getRolePermissions(Role.OWNER);

      // Should have all permissions including management ones
      expect(permissions).toContain(Permission.MANAGE_HABITAT);
      expect(permissions).toContain(Permission.DELETE_HABITAT);
      expect(permissions).toContain(Permission.MANAGE_ROLES);
      expect(permissions).toContain(Permission.REMOVE_MEMBER);

      // Should also inherit all lower role permissions
      expect(permissions).toContain(Permission.READ_HABITAT);
      expect(permissions).toContain(Permission.SEND_MESSAGE);
    });

    it("should return empty array for invalid role", () => {
      const permissions = getRolePermissions("invalid" as Role);
      expect(permissions).toEqual([]);
    });
  });

  describe("roleHasPermission", () => {
    it("should return true when role has permission", () => {
      expect(roleHasPermission(Role.MEMBER, Permission.READ_HABITAT)).toBe(
        true
      );
      expect(roleHasPermission(Role.OWNER, Permission.MANAGE_HABITAT)).toBe(
        true
      );
      expect(
        roleHasPermission(Role.MODERATOR, Permission.MODERATE_DISCUSSION)
      ).toBe(true);
    });

    it("should return false when role lacks permission", () => {
      expect(roleHasPermission(Role.MEMBER, Permission.MANAGE_HABITAT)).toBe(
        false
      );
      expect(
        roleHasPermission(Role.MEMBER, Permission.MODERATE_DISCUSSION)
      ).toBe(false);
    });

    it("should handle role inheritance correctly", () => {
      // Owner should have all member permissions
      expect(roleHasPermission(Role.OWNER, Permission.READ_HABITAT)).toBe(true);
      expect(roleHasPermission(Role.OWNER, Permission.SEND_MESSAGE)).toBe(true);

      // Moderator should have member permissions
      expect(roleHasPermission(Role.MODERATOR, Permission.READ_HABITAT)).toBe(
        true
      );
      expect(roleHasPermission(Role.MODERATOR, Permission.SEND_MESSAGE)).toBe(
        true
      );
    });
  });

  describe("isRoleHigherThan", () => {
    it("should correctly compare role hierarchy", () => {
      expect(isRoleHigherThan(Role.OWNER, Role.ADMIN)).toBe(true);
      expect(isRoleHigherThan(Role.ADMIN, Role.MODERATOR)).toBe(true);
      expect(isRoleHigherThan(Role.MODERATOR, Role.MEMBER)).toBe(true);

      expect(isRoleHigherThan(Role.MEMBER, Role.OWNER)).toBe(false);
      expect(isRoleHigherThan(Role.MODERATOR, Role.ADMIN)).toBe(false);
    });

    it("should return false for same roles", () => {
      expect(isRoleHigherThan(Role.MEMBER, Role.MEMBER)).toBe(false);
      expect(isRoleHigherThan(Role.OWNER, Role.OWNER)).toBe(false);
    });
  });

  describe("getMinimumRoleForPermission", () => {
    it("should return correct minimum role for basic permissions", () => {
      expect(getMinimumRoleForPermission(Permission.READ_HABITAT)).toBe(
        Role.MEMBER
      );
      expect(getMinimumRoleForPermission(Permission.SEND_MESSAGE)).toBe(
        Role.MEMBER
      );
    });

    it("should return correct minimum role for moderation permissions", () => {
      expect(getMinimumRoleForPermission(Permission.MODERATE_DISCUSSION)).toBe(
        Role.MODERATOR
      );
      expect(getMinimumRoleForPermission(Permission.MODERATE_MESSAGE)).toBe(
        Role.MODERATOR
      );
    });

    it("should return correct minimum role for admin permissions", () => {
      expect(getMinimumRoleForPermission(Permission.REMOVE_MEMBER)).toBe(
        Role.ADMIN
      );
      expect(getMinimumRoleForPermission(Permission.INVITE_MEMBER)).toBe(
        Role.ADMIN
      );
    });

    it("should return correct minimum role for owner permissions", () => {
      expect(getMinimumRoleForPermission(Permission.MANAGE_HABITAT)).toBe(
        Role.OWNER
      );
      expect(getMinimumRoleForPermission(Permission.DELETE_HABITAT)).toBe(
        Role.OWNER
      );
      expect(getMinimumRoleForPermission(Permission.MANAGE_ROLES)).toBe(
        Role.OWNER
      );
    });

    it("should return null for non-existent permission", () => {
      expect(getMinimumRoleForPermission("invalid" as Permission)).toBeNull();
    });
  });

  describe("checkSpecialPermissionRule", () => {
    it("should allow users to delete their own messages", () => {
      const canDelete = checkSpecialPermissionRule(Permission.DELETE_MESSAGE, {
        userId: "user-1",
        resourceOwnerId: "user-1",
        userRole: Role.MEMBER,
      });

      expect(canDelete).toBe(true);
    });

    it("should not allow users to delete others messages without proper role", () => {
      const canDelete = checkSpecialPermissionRule(Permission.DELETE_MESSAGE, {
        userId: "user-1",
        resourceOwnerId: "user-2",
        userRole: Role.MEMBER,
      });

      expect(canDelete).toBe(false);
    });

    it("should allow moderators to delete any discussion", () => {
      const canDelete = checkSpecialPermissionRule(
        Permission.DELETE_DISCUSSION,
        {
          userId: "user-1",
          resourceOwnerId: "user-2",
          userRole: Role.MODERATOR,
        }
      );

      expect(canDelete).toBe(true);
    });

    it("should allow users to delete their own discussions", () => {
      const canDelete = checkSpecialPermissionRule(
        Permission.DELETE_DISCUSSION,
        {
          userId: "user-1",
          resourceOwnerId: "user-1",
          userRole: Role.MEMBER,
        }
      );

      expect(canDelete).toBe(true);
    });

    it("should return false for non-existent special rules", () => {
      const result = checkSpecialPermissionRule(Permission.READ_HABITAT, {
        userId: "user-1",
        resourceOwnerId: "user-1",
        userRole: Role.MEMBER,
      });

      expect(result).toBe(false);
    });
  });
});
