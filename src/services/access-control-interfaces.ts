/**
 * TypeScript interfaces for access control operations
 * Defines the contracts for access control service implementations
 */

import type {
  Permission,
  Role,
  AccessContext,
  PermissionResult,
} from "./permission-types";

/**
 * Main interface for the Access Control Service
 * Provides methods for checking permissions and validating access
 */
export interface IAccessControlService {
  /**
   * Check if a user has a specific permission for a resource
   * @param userId - The user's ID
   * @param resourceId - The resource ID (habitat, discussion, etc.)
   * @param permission - The permission to check
   * @param resourceType - The type of resource
   * @returns Promise resolving to boolean indicating if permission is granted
   */
  checkPermission(
    userId: string,
    resourceId: string,
    permission: Permission,
    resourceType?: "habitat" | "discussion" | "message" | "poll" | "watch_party"
  ): Promise<boolean>;

  /**
   * Get the user's role in a specific habitat
   * @param userId - The user's ID
   * @param habitatId - The habitat ID
   * @returns Promise resolving to the user's role or null if not a member
   */
  getUserRole(userId: string, habitatId: string): Promise<Role | null>;

  /**
   * Check if a user has any of the specified permissions
   * @param userId - The user's ID
   * @param resourceId - The resource ID
   * @param permissions - Array of permissions to check
   * @param resourceType - The type of resource
   * @returns Promise resolving to boolean indicating if any permission is granted
   */
  hasAnyPermission(
    userId: string,
    resourceId: string,
    permissions: Permission[],
    resourceType?: "habitat" | "discussion" | "message" | "poll" | "watch_party"
  ): Promise<boolean>;

  /**
   * Validate access and throw an error if permission is denied
   * @param userId - The user's ID
   * @param resourceId - The resource ID
   * @param permission - The permission to validate
   * @param resourceType - The type of resource
   * @throws Error if access is denied
   */
  validateAccess(
    userId: string,
    resourceId: string,
    permission: Permission,
    resourceType?: "habitat" | "discussion" | "message" | "poll" | "watch_party"
  ): Promise<void>;

  /**
   * Get detailed permission result with reasoning
   * @param userId - The user's ID
   * @param resourceId - The resource ID
   * @param permission - The permission to check
   * @param resourceType - The type of resource
   * @returns Promise resolving to detailed permission result
   */
  getPermissionResult(
    userId: string,
    resourceId: string,
    permission: Permission,
    resourceType?: "habitat" | "discussion" | "message" | "poll" | "watch_party"
  ): Promise<PermissionResult>;

  /**
   * Check if a user is a member of a habitat
   * @param userId - The user's ID
   * @param habitatId - The habitat ID
   * @returns Promise resolving to boolean indicating membership status
   */
  isHabitatMember(userId: string, habitatId: string): Promise<boolean>;

  /**
   * Check if a user is the owner of a resource
   * @param userId - The user's ID
   * @param resourceId - The resource ID
   * @param resourceType - The type of resource
   * @returns Promise resolving to boolean indicating ownership
   */
  isResourceOwner(
    userId: string,
    resourceId: string,
    resourceType: "habitat" | "discussion" | "message" | "poll" | "watch_party"
  ): Promise<boolean>;
}

/**
 * Interface for habitat membership information
 */
export interface HabitatMembership {
  userId: string;
  habitatId: string;
  role: Role;
  joinedAt: Date;
  isActive: boolean;
}

/**
 * Interface for resource ownership information
 */
export interface ResourceOwnership {
  resourceId: string;
  resourceType: string;
  ownerId: string;
  createdAt: Date;
}

/**
 * Interface for access control repository operations
 * Defines data access methods needed by the access control service
 */
export interface IAccessControlRepository {
  /**
   * Get user's membership information for a habitat
   */
  getHabitatMembership(
    userId: string,
    habitatId: string
  ): Promise<HabitatMembership | null>;

  /**
   * Get resource ownership information
   */
  getResourceOwnership(
    resourceId: string,
    resourceType: "habitat" | "discussion" | "message" | "poll" | "watch_party"
  ): Promise<ResourceOwnership | null>;

  /**
   * Check if a habitat is public
   */
  isHabitatPublic(habitatId: string): Promise<boolean>;

  /**
   * Get the habitat ID that contains a resource
   */
  getResourceHabitatId(
    resourceId: string,
    resourceType: "discussion" | "message" | "poll" | "watch_party"
  ): Promise<string | null>;
}

/**
 * Configuration options for the access control service
 */
export interface AccessControlConfig {
  /**
   * Whether to cache permission results
   */
  enableCaching?: boolean;

  /**
   * Cache TTL in milliseconds
   */
  cacheTtl?: number;

  /**
   * Whether to log access control decisions for auditing
   */
  enableAuditLogging?: boolean;

  /**
   * Default role for new habitat members
   */
  defaultMemberRole?: Role;
}

/**
 * Interface for access control audit logs
 */
export interface AccessControlAuditLog {
  userId: string;
  resourceId: string;
  resourceType: string;
  permission: Permission;
  granted: boolean;
  reason?: string;
  timestamp: Date;
  userRole?: Role;
}
