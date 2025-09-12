# Implementation Plan

- [x] 1. Update database schema for dashboard architecture

  - Create migration scripts for new tables (chat_rooms, discussions, streams)
  - Update habitat_messages table to include chat_id reference
  - Add database indexes for efficient querying
  - _Requirements: 3.1, 3.2, 4.1, 5.1_

- [x] 2. Create data models and types for dashboard features

  - Define Disucssion, Poll, and Stream TypeScript interfaces
  - Update Message interface to include discussion_id
  - Create validation schemas for new data models
  - _Requirements: 3.1, 4.1, 5.1_

- [x] 3. Implement repository layer for dashboard data
- [x] 3.1 Create discussions repository methods

  - Implement getDiscussionsByHabitat method
  - Implement createDiscussion method
  - Add unit tests for discussions repository operations
  - _Requirements: 5.2_

- [x] 3.2 Create streaming sessions repository methods

  - Implement getStreamingByHabitat method
  - Implement createStream method
  - Add unit tests for streaming sessions repository operations
  - _Requirements: 3.1, 5.1_

- [x] 3.3 Update messages repository for discussion support

  - Update getMessagesByHabitat to getMessagesByDiscussion
  - Update sendMessage to include discussion_id parameter
  - Add unit tests for updated message operations
  - _Requirements: 4.2, 4.3_

- [x] 4. Create service layer for dashboard business logic
- [x] 4.1 Implement habitat dashboard service

  - Create getDashboardData method that aggregates all dashboard information
  - Add validation for dashboard data operations
  - Implement error handling for dashboard data fetching
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 4.2 Update habitat service for discussion operations

  - Add createDiscussion method with validation
  - Add getDiscussionsByHabitat method
  - Update existing methods to work with new architecture
  - _Requirements: 4.1_

- [x] 4.3 Add creation methods to repository layer

  - Add createDiscussion method to discussions repository
  - Add createPoll method to polls repository (new)
  - Add createStream method to streaming sessions repository
  - Add proper error handling and validation for all creation methods
  - _Requirements: 6.1, 7.1, 8.1_

- [x] 4.4 Add creation validation schemas

  - Create Zod schemas for discussion creation validation
  - Create Zod schemas for poll creation validation
  - Create Zod schemas for streaming session creation validation
  - Add error codes for creation-specific validation failures
  - Update error map with user-friendly creation error messages
  - _Requirements: 6.5, 6.6, 7.6, 7.7, 8.6, 8.7_

- [x] 4.5 Update service layer for creation operations

  - Add createDiscussion method to habitats service with business logic
  - Add createPoll method to habitats service with business logic
  - Add createStream method to habitats service with business logic
  - Implement proper validation and error handling for all creation operations
  - _Requirements: 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3_

- [x] 5. Build dashboard UI components
- [x] 5.1 Create HabitatDashboard main component

  - Implement dashboard layout with hero section
  - Add navigation structure and breadcrumbs
  - Integrate with dashboard data service
  - _Requirements: 3.1, 3.2_

- [x] 5.2 Create dashboard hero section component

  - Implement habitat branding display
  - Add primary action buttons (Start Streaming Stream, Create Poll)
  - Style according to visual design system
  - _Requirements: 3.2, 5.1, 5.2_

- [x] 5.6 Update dashboard components for creation integration

  - Add "Create Discussion" button to dashboard layout
  - Update HabitatHero to integrate with creation modals
  - Update HabitatDashboard to manage modal state for all creation types
  - Add real-time updates to dashboard after successful creation
  - Implement proper loading and error states during creation
  - _Requirements: 6.1, 7.1, 8.1_

- [x] 5.3 Create PopularInHabitat component

  - Display popular discussions, polls, and streaming sessions
  - Implement click navigation to specific discussions, and streaming sessions
  - Add loading and empty states
  - _Requirements: 3.3, 4.1_

- [x] 5.4 Create StreamCard component

  - Display streaming session details
  - Buttons for joining/leaving and entering
  - Badge for current status (live/starting in...)
  - Show participant counts and active watch count
  - _Requirements: 3.4, 5.1_

- [x] 5.5 Create HabitatInfo sidebar component

  - Display habitat metadata (creation date, tags, members)
  - Show online member indicators and total member count and creator
  - Implement responsive design for mobile
  - _Requirements: 3.5, 3.6, 3.7_

- [x] 6. Implement Discussion Room functionality
- [x] 6.1 Create Discussion Room page component

  - Implement individual discussion interface at /habitats/:habitatId/discussions/:discussionId
  - Add breadcrumb navigation back to habitat dashboard
  - Integrate with real-time chat functionality
  - _Requirements: 4.1, 4.2_

- [x] 6.2 Create discussion-specific messaging hooks

  - Create useDiscussionMessages hook for discussion-specific message handling
  - Create useDiscussionRealtimeChat hook for discussion room real-time subscriptions
  - Update message repository methods to support discussion_id filtering
  - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 6.3 Update ChatInterface for discussion rooms

  - Modify ChatInterface to accept discussionId parameter
  - Update discussion room page to use discussion-specific hooks
  - Implement discussion room-specific message history and real-time updates
  - Add discussion room header with discussion name and metadata
  - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 6.4 Add discussion service methods

  - Add getDiscussionById method to retrieve discussion details
  - Add discussion name and metadata display in discussion room
  - Update discussion room page to show actual discussion information
  - _Requirements: 4.1, 4.2_

- [x] 7. Create interactive features
- [x] 7.1 Implement discussion creation functionality

  - Create DiscussionCreationForm component with name and description fields
  - Add form validation for discussion name (3-100 chars) and description (max 500 chars)
  - Create DiscussionCreationModal wrapper using Shadcn UI Dialog component
  - Integrate with discussions repository for creation
  - Add "Create Discussion" button to dashboard
  - Navigate to new discussion room after successful creation
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 7.2 Create missing modal components for creation functionality
- [x] 7.2.1 Create PollCreationModal component

  - Create PollCreationModal wrapper using Shadcn UI Dialog component
  - Integrate with existing PollCreationForm component
  - Add proper modal state management and success handling
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 7.2.2 Create StreamCreationModal component

  - Create StreamCreationModal wrapper using Shadcn UI Dialog component
  - Integrate with existing StreamCreationForm component
  - Add proper modal state management and success handling
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 7.3 Fix HabitatDashboard modal imports and integration

  - Remove import errors for non-existent modal components
  - Update modal integration to work with existing and new modal components
  - Test creation workflows from dashboard to ensure proper functionality
  - _Requirements: 6.1, 7.1, 8.1_

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

- [x] 10. Add comprehensive testing
- [x] 10.1 Create unit tests for new components

  - Test HabitatDashboard component rendering and interactions
  - Test dashboard section components (PopularDiscussions, Streaming, etc.)
  - Test DiscussionRoom component functionality
  - _Requirements: All requirements_

- [x] 10.2 Create integration tests for dashboard data flow

  - Test dashboard data aggregation and display
  - Test navigation between dashboard and chat rooms
  - Test real-time updates on dashboard
  - _Requirements: 3.1, 4.1, 4.2_

- [x] 10.3 Create unit tests for creation components

  - Test DiscussionCreationForm validation and submission
  - Test PollCreationForm dynamic options and validation
  - Test StreamCreationForm date/time validation
  - Test all creation modal components
  - Test form error handling and loading states
  - _Requirements: 6.1, 6.5, 6.6, 7.1, 7.6, 7.7, 8.1, 8.6, 8.7_

- [x] 10.4 Create integration tests for creation workflows

  - Test complete discussion creation flow from button click to navigation
  - Test complete poll creation flow from button click to dashboard update
  - Test complete streaming session creation flow from button click to dashboard update
  - Test creation error handling and retry scenarios
  - Test real-time dashboard updates after creation
  - _Requirements: 6.1, 6.4, 7.1, 7.5, 8.1, 8.5_

- [x] 10.5 Create tests for creation components

  - Create unit tests for DiscussionCreationForm component
  - Create unit tests for PollCreationForm component
  - Create unit tests for StreamCreationForm component
  - Create unit tests for all creation modal components
  - Test form validation, submission, and error handling
  - _Requirements: 6.1, 6.5, 6.6, 7.1, 7.6, 7.7, 8.1, 8.6, 8.7_

- [x] 10.6 Update existing tests for new architecture
  - Update any existing habitat tests to work with new routing
  - Update chat interface tests for room-specific functionality
  - Ensure all tests pass with new architecture
  - _Requirements: All requirements_
