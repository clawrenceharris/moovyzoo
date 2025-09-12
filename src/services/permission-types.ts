/**
 * Permission and Role type definitions for access control
 * Defines the core permissions and roles used throughout the application
 */

/**
 * Enum defining all permissions in the system
 * Permissions follow the format: ACTION:RESOURCE
 */
export enum Permission {
  // Habitat permissions
  READ_HABITAT = "read:habitat",
  WRITE_HABITAT = "write:habitat",
  MANAGE_HABITAT = "manage:habitat",
  DELETE_HABITAT = "delete:habitat",

  // Discussion permissions
  CREATE_DISCUSSION = "create:discussion",
  READ_DISCUSSION = "read:discussion",
  MODERATE_DISCUSSION = "moderate:discussion",
  DELETE_DISCUSSION = "delete:discussion",

  // Message permissions
  SEND_MESSAGE = "send:message",
  DELETE_MESSAGE = "delete:message",
  MODERATE_MESSAGE = "moderate:message",

  // Poll permissions
  CREATE_POLL = "create:poll",
  VOTE_POLL = "vote:poll",
  MODERATE_POLL = "moderate:poll",
  DELETE_POLL = "delete:poll",

  // Streaming session permissions
  CREATE_WATCH_PARTY = "create:streaming_session",
  JOIN_WATCH_PARTY = "join:streaming_session",
  MODERATE_WATCH_PARTY = "moderate:streaming_session",
  DELETE_WATCH_PARTY = "delete:streaming_session",

  // Member management permissions
  INVITE_MEMBER = "invite:member",
  REMOVE_MEMBER = "remove:member",
  MANAGE_ROLES = "manage:roles",
}

/**
 * Enum defining user roles within habitats
 * Roles are hierarchical - higher roles inherit permissions from lower roles
 */
export enum Role {
  MEMBER = "member",
  MODERATOR = "moderator",
  ADMIN = "admin",
  OWNER = "owner",
}

/**
 * Interface for access control context
 * Contains information needed to make permission decisions
 */
export interface AccessContext {
  userId: string;
  resourceId: string;
  resourceType:
    | "habitat"
    | "discussion"
    | "message"
    | "poll"
    | "streaming_session";
  userRole?: Role;
  isResourceOwner?: boolean;
  isPublicResource?: boolean;
}

/**
 * Interface for permission check results
 * Provides detailed information about access decisions
 */
export interface PermissionResult {
  granted: boolean;
  reason?: string;
  requiredRole?: Role;
  requiredPermissions?: Permission[];
}

/**
 * Type for permission validation functions
 */
export type PermissionValidator = (
  context: AccessContext,
  permission: Permission
) => Promise<PermissionResult> | PermissionResult;

/**
 * Interface for role-based access control
 */
export interface RolePermissions {
  role: Role;
  permissions: Permission[];
  inheritsFrom?: Role[];
}
