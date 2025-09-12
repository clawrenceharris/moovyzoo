/**
 * Centralized Access Control Service
 * Handles all permission checking and access validation for the application
 */

import type {
  IAccessControlService,
  HabitatMembership,
  ResourceOwnership,
  AccessControlConfig,
} from "./access-control-interfaces";
import {
  Permission,
  Role,
  type AccessContext,
  type PermissionResult,
} from "./permission-types";
import {
  getRolePermissions,
  roleHasPermission,
  checkSpecialPermissionRule,
  getMinimumRoleForPermission,
} from "./role-definitions";
import { habitatsRepository } from "@/features/habitats/data";
import { normalizeError } from "@/utils/normalize-error";
import { AppErrorCode } from "@/utils/error-codes";

/**
 * Implementation of the Access Control Service
 * Provides centralized permission checking and access validation
 */
export class AccessControlService implements IAccessControlService {
  private config: AccessControlConfig;
  private permissionCache = new Map<
    string,
    { result: boolean; timestamp: number }
  >();

  constructor(config: AccessControlConfig = {}) {
    this.config = {
      enableCaching: config.enableCaching ?? true,
      cacheTtl: config.cacheTtl ?? 5 * 60 * 1000, // 5 minutes default
      enableAuditLogging: config.enableAuditLogging ?? false,
      defaultMemberRole: config.defaultMemberRole ?? Role.MEMBER,
      ...config,
    };
  }

  /**
   * Check if a user has a specific permission for a resource
   */
  async checkPermission(
    userId: string,
    resourceId: string,
    permission: Permission,
    resourceType:
      | "habitat"
      | "discussion"
      | "message"
      | "poll"
      | "streaming_session" = "habitat"
  ): Promise<boolean> {
    try {
      if (!userId || !resourceId) {
        return false;
      }

      // Check cache first
      const cacheKey = `${userId}:${resourceId}:${permission}:${resourceType}`;
      if (this.config.enableCaching) {
        const cached = this.permissionCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.config.cacheTtl!) {
          return cached.result;
        }
      }

      // Build access context
      const context = await this.buildAccessContext(
        userId,
        resourceId,
        resourceType
      );

      // Check permission
      const result = await this.evaluatePermission(context, permission);

      // Cache result
      if (this.config.enableCaching) {
        this.permissionCache.set(cacheKey, {
          result: result.granted,
          timestamp: Date.now(),
        });
      }

      // Log if enabled
      if (this.config.enableAuditLogging) {
        this.logAccessDecision(
          userId,
          resourceId,
          resourceType,
          permission,
          result.granted,
          result.reason
        );
      }

      return result.granted;
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  }

  /**
   * Get the user's role in a specific habitat
   */
  async getUserRole(userId: string, habitatId: string): Promise<Role | null> {
    try {
      if (!userId || !habitatId) {
        return null;
      }

      // Check if user is the habitat owner
      const habitat = await habitatsRepository.getHabitatById(
        habitatId,
        userId
      );
      if (habitat.created_by === userId) {
        return Role.OWNER;
      }

      // Check if user is a member
      const isMember = await habitatsRepository.isUserMember(habitatId, userId);
      if (!isMember) {
        return null;
      }

      // For now, all non-owner members are regular members
      // TODO: Implement role management system for moderators/admins
      return Role.MEMBER;
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  }

  /**
   * Check if a user has any of the specified permissions
   */
  async hasAnyPermission(
    userId: string,
    resourceId: string,
    permissions: Permission[],
    resourceType:
      | "habitat"
      | "discussion"
      | "message"
      | "poll"
      | "streaming_session" = "habitat"
  ): Promise<boolean> {
    try {
      for (const permission of permissions) {
        const hasPermission = await this.checkPermission(
          userId,
          resourceId,
          permission,
          resourceType
        );
        if (hasPermission) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error checking any permission:", error);
      return false;
    }
  }

  /**
   * Validate access and throw an error if permission is denied
   */
  async validateAccess(
    userId: string,
    resourceId: string,
    permission: Permission,
    resourceType:
      | "habitat"
      | "discussion"
      | "message"
      | "poll"
      | "streaming_session" = "habitat"
  ): Promise<void> {
    const hasAccess = await this.checkPermission(
      userId,
      resourceId,
      permission,
      resourceType
    );

    if (!hasAccess) {
      const error = new Error("Access denied");
      error.name = "ACCESS_DENIED";
      throw normalizeError(error);
    }
  }

  /**
   * Get detailed permission result with reasoning
   */
  async getPermissionResult(
    userId: string,
    resourceId: string,
    permission: Permission,
    resourceType:
      | "habitat"
      | "discussion"
      | "message"
      | "poll"
      | "streaming_session" = "habitat"
  ): Promise<PermissionResult> {
    try {
      const context = await this.buildAccessContext(
        userId,
        resourceId,
        resourceType
      );
      return await this.evaluatePermission(context, permission);
    } catch (error) {
      return {
        granted: false,
        reason: "Error evaluating permission",
      };
    }
  }

  /**
   * Check if a user is a member of a habitat
   */
  async isHabitatMember(userId: string, habitatId: string): Promise<boolean> {
    try {
      if (!userId || !habitatId) {
        return false;
      }

      // Owners are always considered members
      const habitat = await habitatsRepository.getHabitatById(
        habitatId,
        userId
      );
      if (habitat.created_by === userId) {
        return true;
      }

      return await habitatsRepository.isUserMember(habitatId, userId);
    } catch (error) {
      console.error("Error checking habitat membership:", error);
      return false;
    }
  }

  /**
   * Check if a user is the owner of a resource
   */
  async isResourceOwner(
    userId: string,
    resourceId: string,
    resourceType:
      | "habitat"
      | "discussion"
      | "message"
      | "poll"
      | "streaming_session"
  ): Promise<boolean> {
    try {
      if (!userId || !resourceId) {
        return false;
      }

      switch (resourceType) {
        case "habitat": {
          const habitat = await habitatsRepository.getHabitatById(resourceId);
          return habitat.created_by === userId;
        }

        case "discussion": {
          const discussion = await habitatsRepository.getDiscussionById(
            resourceId
          );
          return discussion.created_by === userId;
        }

        case "message": {
          const message = await habitatsRepository.getMessageById(resourceId);
          return message.user_id === userId;
        }

        // TODO: Implement for polls and streaming sessions when those methods are available
        case "poll":
        case "streaming_session":
          return false;

        default:
          return false;
      }
    } catch (error) {
      console.error("Error checking resource ownership:", error);
      return false;
    }
  }

  /**
   * Build access context for permission evaluation
   */
  private async buildAccessContext(
    userId: string,
    resourceId: string,
    resourceType:
      | "habitat"
      | "discussion"
      | "message"
      | "poll"
      | "streaming_session"
  ): Promise<AccessContext> {
    let habitatId = resourceId;
    let userRole: Role | undefined;
    let isResourceOwner = false;
    let isPublicResource = false;

    try {
      // Get habitat ID for non-habitat resources
      if (resourceType !== "habitat") {
        habitatId = await this.getResourceHabitatId(resourceId, resourceType);
      }

      // Get user role in the habitat
      userRole = (await this.getUserRole(userId, habitatId)) || undefined;

      // Check if user owns the specific resource
      isResourceOwner = await this.isResourceOwner(
        userId,
        resourceId,
        resourceType
      );

      // Check if resource/habitat is public
      if (resourceType === "habitat") {
        const habitat = await habitatsRepository.getHabitatById(resourceId);
        isPublicResource = habitat.is_public;
      } else {
        const habitat = await habitatsRepository.getHabitatById(habitatId);
        isPublicResource = habitat.is_public;
      }
    } catch (error) {
      console.error("Error building access context:", error);
    }

    return {
      userId,
      resourceId,
      resourceType,
      userRole,
      isResourceOwner,
      isPublicResource,
    };
  }

  /**
   * Evaluate permission based on access context
   */
  private async evaluatePermission(
    context: AccessContext,
    permission: Permission
  ): Promise<PermissionResult> {
    // Check special permission rules first (e.g., "users can delete their own messages")
    if (context.isResourceOwner) {
      const specialRuleApplies = checkSpecialPermissionRule(permission, {
        userId: context.userId,
        resourceOwnerId: context.userId, // User is the owner
        userRole: context.userRole,
      });

      if (specialRuleApplies) {
        return {
          granted: true,
          reason: "Resource owner has special permission",
        };
      }
    }

    // For public habitats, allow read access even for non-members
    if (context.isPublicResource && permission === Permission.READ_HABITAT) {
      return {
        granted: true,
        reason: "Public habitat allows read access",
      };
    }

    // Check if user has role-based permission
    if (context.userRole) {
      const hasRolePermission = roleHasPermission(context.userRole, permission);
      if (hasRolePermission) {
        return {
          granted: true,
          reason: `Role ${context.userRole} has permission`,
        };
      }
    }

    // Permission denied
    const minimumRole = getMinimumRoleForPermission(permission);
    return {
      granted: false,
      reason: context.userRole
        ? `Role ${context.userRole} lacks permission`
        : "User is not a member",
      requiredRole: minimumRole || undefined,
      requiredPermissions: [permission],
    };
  }

  /**
   * Get the habitat ID that contains a resource
   */
  private async getResourceHabitatId(
    resourceId: string,
    resourceType: "discussion" | "message" | "poll" | "streaming_session"
  ): Promise<string> {
    try {
      switch (resourceType) {
        case "discussion": {
          const discussion = await habitatsRepository.getDiscussionById(
            resourceId
          );
          return discussion.habitat_id;
        }

        case "message": {
          const message = await habitatsRepository.getMessageById(resourceId);
          return message.habitat_id;
        }

        // TODO: Implement for polls and streaming sessions
        case "poll":
        case "streaming_session":
          throw new Error(`Resource type ${resourceType} not yet implemented`);

        default:
          throw new Error(`Unknown resource type: ${resourceType}`);
      }
    } catch (error) {
      throw new Error(
        `Failed to get habitat ID for ${resourceType} ${resourceId}: ${error}`
      );
    }
  }

  /**
   * Log access control decisions for auditing
   */
  private logAccessDecision(
    userId: string,
    resourceId: string,
    resourceType: string,
    permission: Permission,
    granted: boolean,
    reason?: string
  ): void {
    if (this.config.enableAuditLogging) {
      console.log("Access Control Decision:", {
        userId,
        resourceId,
        resourceType,
        permission,
        granted,
        reason,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Clear permission cache (useful for testing or when roles change)
   */
  clearCache(): void {
    this.permissionCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate?: number } {
    return {
      size: this.permissionCache.size,
      // TODO: Implement hit rate tracking
    };
  }
}

// Export singleton instance
export const accessControlService = new AccessControlService({
  enableCaching: true,
  cacheTtl: 5 * 60 * 1000, // 5 minutes
  enableAuditLogging: process.env.NODE_ENV === "development",
});
