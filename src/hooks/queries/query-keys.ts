/**
 * Centralized query key factory for Habitats-related queries
 * Provides consistent query key patterns for React Query caching
 */

/**
 * Query keys for Habitats feature
 * Organized hierarchically for efficient cache invalidation
 */
export const queryKeys = {
  // Habitat-related queries
  habitats: {
    all: ["habitats"] as const,
    lists: () => [...queryKeys.habitats.all, "list"] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.habitats.lists(), { filters }] as const,
    details: () => [...queryKeys.habitats.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.habitats.details(), id] as const,
    dashboard: (id: string) =>
      [...queryKeys.habitats.detail(id), "dashboard"] as const,
    members: (id: string) =>
      [...queryKeys.habitats.detail(id), "members"] as const,
    stats: (id: string) => [...queryKeys.habitats.detail(id), "stats"] as const,
    userHabitats: (userId: string) =>
      [...queryKeys.habitats.all, "user", userId] as const,
  },

  // Discussion-related queries
  discussions: {
    all: ["discussions"] as const,
    lists: () => [...queryKeys.discussions.all, "list"] as const,
    byHabitat: (habitatId: string) =>
      [...queryKeys.discussions.lists(), "habitat", habitatId] as const,
    details: () => [...queryKeys.discussions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.discussions.details(), id] as const,
    messages: (discussionId: string) =>
      [...queryKeys.discussions.detail(discussionId), "messages"] as const,
  },

  // Message-related queries
  messages: {
    all: ["messages"] as const,
    byHabitat: (habitatId: string) =>
      [...queryKeys.messages.all, "habitat", habitatId] as const,
    byDiscussion: (discussionId: string) =>
      [...queryKeys.messages.all, "discussion", discussionId] as const,
    recent: (habitatId: string) =>
      [...queryKeys.messages.byHabitat(habitatId), "recent"] as const,
  },

  // Poll-related queries
  polls: {
    all: ["polls"] as const,
    byHabitat: (habitatId: string) =>
      [...queryKeys.polls.all, "habitat", habitatId] as const,
    detail: (id: string) => [...queryKeys.polls.all, "detail", id] as const,
    results: (id: string) =>
      [...queryKeys.polls.detail(id), "results"] as const,
  },

  // Watch party-related queries
  watchParties: {
    all: ["watchParties"] as const,
    byHabitat: (habitatId: string) =>
      [...queryKeys.watchParties.all, "habitat", habitatId] as const,
    detail: (id: string) =>
      [...queryKeys.watchParties.all, "detail", id] as const,
    upcoming: (habitatId: string) =>
      [...queryKeys.watchParties.byHabitat(habitatId), "upcoming"] as const,
    active: (habitatId: string) =>
      [...queryKeys.watchParties.byHabitat(habitatId), "active"] as const,
  },

  // User-related queries
  users: {
    all: ["users"] as const,
    profile: (userId: string) =>
      [...queryKeys.users.all, "profile", userId] as const,
    preferences: (userId: string) =>
      [...queryKeys.users.profile(userId), "preferences"] as const,
  },

  // Search-related queries
  search: {
    all: ["search"] as const,
    habitats: (query: string) =>
      [...queryKeys.search.all, "habitats", query] as const,
    discussions: (query: string) =>
      [...queryKeys.search.all, "discussions", query] as const,
    users: (query: string) =>
      [...queryKeys.search.all, "users", query] as const,
  },
} as const;

/**
 * Helper functions for query key operations
 */
export const queryKeyHelpers = {
  /**
   * Invalidate all habitat-related queries
   */
  invalidateHabitats: () => queryKeys.habitats.all,

  /**
   * Invalidate specific habitat queries
   */
  invalidateHabitat: (habitatId: string) =>
    queryKeys.habitats.detail(habitatId),

  /**
   * Invalidate habitat dashboard data
   */
  invalidateHabitatDashboard: (habitatId: string) =>
    queryKeys.habitats.dashboard(habitatId),

  /**
   * Invalidate discussion queries for a habitat
   */
  invalidateHabitatDiscussions: (habitatId: string) =>
    queryKeys.discussions.byHabitat(habitatId),

  /**
   * Invalidate message queries for a habitat
   */
  invalidateHabitatMessages: (habitatId: string) =>
    queryKeys.messages.byHabitat(habitatId),

  /**
   * Invalidate all user-related queries
   */
  invalidateUser: (userId: string) => queryKeys.users.profile(userId),

  /**
   * Get all query keys that should be invalidated when a habitat is updated
   */
  getHabitatInvalidationKeys: (habitatId: string) => [
    queryKeys.habitats.detail(habitatId),
    queryKeys.habitats.dashboard(habitatId),
    queryKeys.habitats.members(habitatId),
    queryKeys.habitats.stats(habitatId),
    queryKeys.discussions.byHabitat(habitatId),
    queryKeys.messages.byHabitat(habitatId),
    queryKeys.polls.byHabitat(habitatId),
    queryKeys.watchParties.byHabitat(habitatId),
  ],

  /**
   * Get all query keys that should be invalidated when a discussion is updated
   */
  getDiscussionInvalidationKeys: (discussionId: string, habitatId: string) => [
    queryKeys.discussions.detail(discussionId),
    queryKeys.discussions.byHabitat(habitatId),
    queryKeys.messages.byDiscussion(discussionId),
    queryKeys.habitats.dashboard(habitatId),
  ],
};

/**
 * Type helpers for query keys
 */
export type QueryKey = typeof queryKeys;
export type HabitatQueryKey = typeof queryKeys.habitats;
export type DiscussionQueryKey = typeof queryKeys.discussions;
export type MessageQueryKey = typeof queryKeys.messages;
