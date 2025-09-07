# Implementation Plan

- [x] 1. Create database schema and migration scripts
  - Create SQL migration script for friends table with proper constraints and RLS policies
  - Create SQL migration script for watch_history table with indexes and security policies
  - Add database indexes for query performance optimization
  - Refer to the design file for understanding the task logic: .kiro/specs/friends-discovery/design.md
  - Implement only the instructions in this task. Do not modify any irrelevant files
  - Write clean code following simple approach, without adding unnecessary complexity
  - _Requirements: 1.1, 2.1, 3.1, 5.1_

- [ ] 2. Extend type definitions and error handling
  - Add Friend, FriendRequest, FriendStatus, and WatchHistoryEntry types to profiles.types.ts
  - Add ProfileWithFriendStatus interface extending existing UserProfile type
  - Add new error codes for friend operations to error-codes.ts
  - Add corresponding error messages to error-map.ts
  - Refer to the design file for understanding the task logic: .kiro/specs/friends-discovery/design.md
  - Implement only the instructions in this task. Do not modify any irrelevant files
  - Write clean code following simple approach, without adding unnecessary complexity
  - Build on existing code written in the previous tasks
  - _Requirements: 2.2, 2.4, 3.3, 7.4_

- [x] 3. Create friends data repository
  - Implement FriendsRepository class following existing ProfilesRepository pattern
  - Add methods for sendFriendRequest, getFriendStatus, getPendingRequests, acceptFriendRequest, declineFriendRequest
  - Include proper error handling and Supabase client integration
  - Refer to the design file for understanding the task logic: .kiro/specs/friends-discovery/design.md
  - The supabase clients are already defined in the codebase: src/middleware.ts, src/utils/supabase/**
  - Implement only the instructions in this task. Do not modify any irrelevant files
  - Write clean code following simple approach, without adding unnecessary complexity
  - Build on existing code written in the previous tasks
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3_

- [ ] 4. Create watch history data repository
  - Implement WatchHistoryRepository class with addWatchEntry, updateWatchEntry, getUserWatchHistory methods
  - Follow existing repository patterns for database operations and error handling
  - Include validation for TMDB movie/TV data structure
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 5. Extend profiles repository with friend functionality
  - Add getPublicProfilesWithFriendStatus method to existing ProfilesRepository
  - Add getProfileWithFriendStatus method for individual profile viewing
  - Update existing getPublicProfiles method to exclude current user
  - _Requirements: 1.1, 1.2, 4.1, 4.2_

- [ ] 6. Create friends API endpoints
  - Implement POST /api/friends route for sending friend requests
  - Implement PATCH /api/friends/[requestId] route for accepting/declining requests
  - Implement GET /api/friends/requests route for fetching pending requests
  - Follow existing API patterns with proper error handling and server-side validation
  - _Requirements: 2.1, 2.3, 3.1, 3.2, 3.3_

- [ ] 7. Create enhanced profiles API endpoints
  - Implement GET /api/profiles/discover route replacing client-side profile fetching
  - Implement GET /api/profiles/[userId] route for individual profile viewing with friend status
  - Update endpoints to include friend status and watch history data
  - _Requirements: 1.1, 1.2, 4.1, 4.2, 4.3_

- [ ] 8. Create watch history API endpoint
  - Implement POST /api/watch-history route for adding/updating watch entries
  - Include TMDB data validation and proper error responses
  - Follow existing API endpoint patterns for consistency
  - _Requirements: 5.1, 5.2, 5.5_

- [ ] 9. Create friend request notification component
  - Build FriendRequestNotification component for header display
  - Add notification icon with pending request count
  - Include click handler to open friend requests modal
  - Use existing UI components (Button, Badge) for consistency
  - _Requirements: 3.1, 3.6_

- [ ] 10. Create friend requests modal component
  - Build FriendRequestsModal component using existing Modal and Card components
  - Display pending requests with requester info and accept/decline buttons
  - Include proper loading states and error handling
  - Follow existing modal patterns in the codebase
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ] 11. Enhance ProfileCard component with friend actions
  - Add friend status display and action buttons to existing ProfileCard
  - Include "Add Friend", "Request Sent", "Friends" button states
  - Add onFriendAction prop for handling friend request actions
  - Maintain existing ProfileCard functionality and styling
  - _Requirements: 1.3, 1.4, 1.5, 2.3_

- [ ] 12. Update ProfilePage component with friend functionality
  - Add friend status display and action button to ProfileHeader
  - Include recent watch history section using existing component patterns
  - Add friend/unfriend functionality for profile viewing
  - Maintain existing ProfilePage layout and functionality
  - _Requirements: 4.1, 4.2, 4.3, 5.4_

- [ ] 13. Update discovery page with enhanced profile fetching
  - Replace placeholder content with actual profile discovery functionality
  - Integrate with new /api/profiles/discover endpoint
  - Add friend action handling and status updates
  - Use existing LoadingState and EmptyState components
  - _Requirements: 1.1, 1.2, 1.3, 8.1, 8.2_

- [ ] 14. Add friend request notification to app header
  - Integrate FriendRequestNotification component into existing Header component
  - Add friend requests modal state management
  - Include proper positioning and styling consistent with existing header
  - _Requirements: 3.1, 3.6_

- [ ] 15. Create watch history tracking integration
  - Add watch history tracking hooks for movie/TV interactions
  - Integrate with existing TMDB API calls to capture viewing data
  - Include rating and status update functionality
  - _Requirements: 5.1, 5.2, 5.3, 5.5_