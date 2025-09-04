/**
 * Role and permission mappings for the access control system
 * Defines what permissions each role has and role hierarchies
 */

import { Role, Permission, type RolePermissions } from "./permission-types";

/**
 * Base permissions for each role (without inheritance)
 */
const BASE_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.MEMBER]: [
    // Basic habitat access
    Permission.READ_HABITAT,

    // Discussion participation
    Permission.CREATE_DISCUSSION,
    Permission.READ_DISCUSSION,

    // Message participation
    Permission.SEND_MESSAGE,
    Permission.DELETE_MESSAGE, // Own messages only (enforced in service logic)

    // Poll participation
    Permission.CREATE_POLL,
    Permission.VOTE_POLL,

    // Watch party participation
    Permission.CREATE_WATCH_PARTY,
    Permission.JOIN_WATCH_PARTY,
  ],

  [Role.MODERATOR]: [
    // Additional moderation permissions
    Permission.MODERATE_DISCUSSION,
    Permission.MODERATE_MESSAGE,
    Permission.MODERATE_POLL,
    Permission.MODERATE_WATCH_PARTY,

    // Can delete others' content
    Permission.DELETE_DISCUSSION,
    Permission.DELETE_POLL,
    Permission.DELETE_WATCH_PARTY,
  ],

  [Role.ADMIN]: [
    // Additional admin permissions
    Permission.WRITE_HABITAT,
    Permission.INVITE_MEMBER,
    Permission.REMOVE_MEMBER,
  ],

  [Role.OWNER]: [
    // Full control permissions
    Permission.MANAGE_HABITAT,
    Permission.DELETE_HABITAT,
    Permission.MANAGE_ROLES,
  ],
};

/**
 * Permission mappings for each role with inheritance resolved
 */
export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  [Role.MEMBER]: {
    role: Role.MEMBER,
    permissions: BASE_ROLE_PERMISSIONS[Role.MEMBER],
  },

  [Role.MODERATOR]: {
    role: Role.MODERATOR,
    permissions: [
      ...BASE_ROLE_PERMISSIONS[Role.MEMBER],
      ...BASE_ROLE_PERMISSIONS[Role.MODERATOR],
    ],
    inheritsFrom: [Role.MEMBER],
  },

  [Role.ADMIN]: {
    role: Role.ADMIN,
    permissions: [
      ...BASE_ROLE_PERMISSIONS[Role.MEMBER],
      ...BASE_ROLE_PERMISSIONS[Role.MODERATOR],
      ...BASE_ROLE_PERMISSIONS[Role.ADMIN],
    ],
    inheritsFrom: [Role.MODERATOR, Role.MEMBER],
  },

  [Role.OWNER]: {
    role: Role.OWNER,
    permissions: [
      ...BASE_ROLE_PERMISSIONS[Role.MEMBER],
      ...BASE_ROLE_PERMISSIONS[Role.MODERATOR],
      ...BASE_ROLE_PERMISSIONS[Role.ADMIN],
      ...BASE_ROLE_PERMISSIONS[Role.OWNER],
    ],
    inheritsFrom: [Role.ADMIN, Role.MODERATOR, Role.MEMBER],
  },
};

/**
 * Get all permissions for a given role, including inherited permissions
 */
export function getRolePermissions(role: Role): Permission[] {
  const roleConfig = ROLE_PERMISSIONS[role];
  if (!roleConfig) {
    return [];
  }

  return roleConfig.permissions;
}

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: Role, permission: Permission): boolean {
  const permissions = getRolePermissions(role);
  return permissions.includes(permission);
}

/**
 * Get the role hierarchy - roles that inherit from the given role
 */
export function getRoleHierarchy(role: Role): Role[] {
  const roleConfig = ROLE_PERMISSIONS[role];
  return roleConfig?.inheritsFrom || [];
}

/**
 * Check if one role is higher than another in the hierarchy
 */
export function isRoleHigherThan(role1: Role, role2: Role): boolean {
  const roleOrder = [Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.OWNER];
  const role1Index = roleOrder.indexOf(role1);
  const role2Index = roleOrder.indexOf(role2);

  return role1Index > role2Index;
}

/**
 * Get the minimum role required for a permission
 */
export function getMinimumRoleForPermission(
  permission: Permission
): Role | null {
  for (const role of [Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.OWNER]) {
    if (roleHasPermission(role, permission)) {
      return role;
    }
  }
  return null;
}

/**
 * Special permission rules that override role-based permissions
 * These handle cases like "users can delete their own messages"
 */
export interface SpecialPermissionRule {
  permission: Permission;
  condition: (context: {
    userId: string;
    resourceOwnerId?: string;
    userRole?: Role;
  }) => boolean;
  description: string;
}

export const SPECIAL_PERMISSION_RULES: SpecialPermissionRule[] = [
  {
    permission: Permission.DELETE_MESSAGE,
    condition: ({ userId, resourceOwnerId }) => userId === resourceOwnerId,
    description: "Users can delete their own messages",
  },
  {
    permission: Permission.DELETE_DISCUSSION,
    condition: ({ userId, resourceOwnerId, userRole }) =>
      userId === resourceOwnerId ||
      Boolean(userRole && isRoleHigherThan(userRole, Role.MEMBER)),
    description:
      "Users can delete their own discussions, or moderators+ can delete any",
  },
  {
    permission: Permission.DELETE_POLL,
    condition: ({ userId, resourceOwnerId, userRole }) =>
      userId === resourceOwnerId ||
      Boolean(userRole && isRoleHigherThan(userRole, Role.MEMBER)),
    description:
      "Users can delete their own polls, or moderators+ can delete any",
  },
  {
    permission: Permission.DELETE_WATCH_PARTY,
    condition: ({ userId, resourceOwnerId, userRole }) =>
      userId === resourceOwnerId ||
      Boolean(userRole && isRoleHigherThan(userRole, Role.MEMBER)),
    description:
      "Users can delete their own watch parties, or moderators+ can delete any",
  },
];

/**
 * Check if a special permission rule applies
 */
export function checkSpecialPermissionRule(
  permission: Permission,
  context: { userId: string; resourceOwnerId?: string; userRole?: Role }
): boolean {
  const rule = SPECIAL_PERMISSION_RULES.find(
    (r) => r.permission === permission
  );
  return rule ? rule.condition(context) : false;
}
