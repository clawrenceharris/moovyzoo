# Implementation Plan

- [x] 1. Update database schema for dashboard architecture

  - Create migration scripts for new tables (chat_rooms, discussions, watch_parties)
  - Update habitat_messages table to include chat_id reference
  - Add database indexes for efficient querying
  - _Requirements: 3.1, 3.2, 4.1, 5.1_

- [x] 2. Create data models and types for dashboard features

  - Define Disucssion, Poll, and WatchParty TypeScript interfaces
  - Update Message interface to include discussion_id
  - Create validation schemas for new data models
  - _Requirements: 3.1, 4.1, 5.1_

- [x] 3. Implement repository layer for dashboard data
- [x] 3.1 Create discussions repository methods

  - Implement getDiscussionsByHabitat method
  - Implement createDiscussion method
  - Add unit tests for discussions repository operations
  - _Requirements: 5.2_

- [x] 3.2 Create watch parties repository methods

  - Implement getWatchPartiesByHabitat method
  - Implement createWatchParty method
  - Add unit tests for watch parties repository operations
  - _Requirements: 3.1, 5.1_

- [x] 3.3 Update messages repository for discussion support

  - Update getMessagesByHabitat to getMessagesByDiscussion
  - Update sendMessage to include discussion_id parameter
  - Add unit tests for updated message operations
  - _Requirements: 4.2, 4.3_

- [ ] 4. Create service layer for dashboard business logic
- [ ] 4.1 Implement habitat dashboard service

  - Create getDashboardData method that aggregates all dashboard information
  - Add validation for dashboard data operations
  - Implement error handling for dashboard data fetching
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 4.2 Update habitat service for discussion operations

  - Add createDiscussion method with validation
  - Add getDiscussionsByHabitat method
  - Update existing methods to work with new architecture
  - _Requirements: 4.1_

- [x] 5. Build dashboard UI components
- [x] 5.1 Create HabitatDashboard main component

  - Implement dashboard layout with hero section
  - Add navigation structure and breadcrumbs
  - Integrate with dashboard data service
  - _Requirements: 3.1, 3.2_

- [x] 5.2 Create dashboard hero section component

  - Implement habitat branding display
  - Add primary action buttons (Start Streaming Party, Create Poll)
  - Style according to visual design system
  - _Requirements: 3.2, 5.1, 5.2_

- [x] 5.3 Create PopularInHabitat component

  - Display popular discussions, polls, and watch parties
  - Implement click navigation to specific discussions, and watch parties
  - Add loading and empty states
  - _Requirements: 3.3, 4.1_

- [x] 5.4 Create WatchPartyCard component

  - Display watch party details
  - Buttons for joining/leaving and entering
  - Badge for current status (live/starting in...)
  - Show participant counts and active watch count
  - _Requirements: 3.4, 5.1_

- [x] 5.5 Create HabitatInfo sidebar component

  - Display habitat metadata (creation date, tags, members)
  - Show online member indicators and total member count and creator
  - Implement responsive design for mobile
  - _Requirements: 3.5, 3.6, 3.7_

- [ ] 6. Implement Discussion Room functionality
- [ ] 6.1 Create Discussion Room page component

  - Implement individual discussion interface at /habitats/:habitatId/discussions/:discussionId
  - Add breadcrumb navigation back to habitat dashboard
  - Integrate with real-time chat functionality
  - _Requirements: 4.1, 4.2_

- [ ] 6.2 Update ChatInterface for discussion-specific messaging

  - Modify ChatInterface to work with specific discussion rooms
  - Update real-time subscriptions to be discussion room specific
  - Implement discussion room-specific message history loading
  - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [ ] 6.3 Update real-time hooks for Discussion Rooms

  - Modify useRealtimeChat to work with discussion room channels
  - Update useHabitatMessages to useDiscussionRoomMessages
  - Implement proper cleanup for room-specific subscriptions
  - _Requirements: 4.2, 4.3_

- [ ] 7. Create interactive features
- [ ] 7.1 Implement streaming party creation

  - Create streaming party creation modal/form
  - Integrate with watch parties repository
  - Add form validation and error handling
  - _Requirements: 5.1, 5.4_

- [ ] 7.2 Implement poll creation functionality

  - Create poll creation interface
  - Integrate with discussions repository
  - Add poll participation and voting features
  - _Requirements: 5.2, 5.3_

- [x] 8. Update routing and navigation
- [x] 8.1 Update habitat page routing

  - Modify /habitats/[id]/page.tsx to show dashboard instead of chat
  - Implement proper data fetching for dashboard
  - Add error handling and loading states
  - _Requirements: 1.3, 3.1_

- [x] 8.2 Create discussion room routing

  - Create /habitats/[id]/discussions/[discussionId]/page.tsx
  - Implement proper data fetching for discussion room
  - Add navigation guards and error handling
  - _Requirements: 4.1, 4.2_

- [x] 9. Update existing components for new architecture
- [x] 9.1 Update HabitatList component

  - Ensure navigation goes to dashboard instead of direct chat
  - Update activity indicators to reflect dashboard data
  - Test integration with updated routing
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 9.2 Update HabitatRoom component

  - Update HabitatRoom to be the dashboard and change name to HabitatDashboard
  - Ensure no breaking changes to existing functionality
  - Update any references throughout the codebase
  - _Requirements: 3.1_

- [ ] 10. Add comprehensive testing
- [ ] 10.1 Create unit tests for new components

  - Test HabitatDashboard component rendering and interactions
  - Test dashboard section components (PopularDiscussions, WatchParties, etc.)
  - Test DiscussionRoom component functionality
  - _Requirements: All requirements_

- [ ] 10.2 Create integration tests for dashboard data flow

  - Test dashboard data aggregation and display
  - Test navigation between dashboard and chat rooms
  - Test real-time updates on dashboard
  - _Requirements: 3.1, 4.1, 4.2_

- [ ] 10.3 Update existing tests for new architecture
  - Update any existing habitat tests to work with new routing
  - Update chat interface tests for room-specific functionality
  - Ensure all tests pass with new architecture
  - _Requirements: All requirements_
