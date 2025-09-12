# Streaming Session Media Integration - Implementation Plan

## Task Overview

This implementation plan transforms streaming sessions into comprehensive watch party experiences with media integration, participant management, real-time video synchronization, and interactive features. The tasks build incrementally from database foundation through UI components to complete watch party functionality including join/leave actions, video player, and real-time chat.

## Implementation Tasks

**Note:** Tasks 1-14 focus on media integration and search functionality. Tasks 15-26 add participant management, video player, and real-time features. Some tasks can be worked on in parallel, but database tasks (1, 15) should be completed before dependent service and UI tasks.

- [x] 1. Database schema updates for media storage

  - Create migration script to add media columns to habitat_watch_parties table
  - Add tmdb_id, media_type, media_title, poster_path, release_date columns
  - Create indexes for efficient media queries
  - Test migration with existing data to ensure backward compatibility
  - _Requirements: 5.1, 5.2_

- [x] 2. TMDB service layer implementation

  - Create TMDB service class with search and image URL methods
  - Implement searchMedia method using moviedb-promise multi-search
  - Add getImageUrl method for constructing poster URLs with proper sizing
  - Implement error handling for API failures and rate limiting
  - Add request debouncing and caching for performance
  - Create TypeScript interfaces for TMDB search results and selected media
  - _Requirements: 1.2, 1.3, 4.1, 4.4, 6.1, 6.2_

- [ ] 3. Media search field component

  - Create MediaSearchField component with search input and results dropdown
  - Implement debounced search functionality (300ms delay, minimum 3 characters)
  - Add loading states and error handling for search operations
  - Create search results list with poster images, titles, and media type badges
  - Implement media selection and clear functionality
  - Add keyboard navigation support for accessibility
  - Style component to match design system and ensure mobile responsiveness
  - _Requirements: 1.1, 1.4, 1.5, 4.2, 4.3, 4.5, 7.1, 7.3_

- [ ] 4. Update streaming session creation form

  - Integrate MediaSearchField into StreamCreationForm component
  - Update form validation schema to include optional media fields
  - Modify form submission to include selected media data
  - Ensure form works correctly with and without media selection
  - Add form field for media search with proper labeling and help text
  - _Requirements: 1.1, 1.6, 6.1_

- [x] 5. Update streaming session data layer

  - Modify habitats repository to handle media fields in streaming session creation
  - Update createStream method to store media information
  - Modify getStreaming methods to include media data in responses
  - Add database mapping functions for media fields
  - Implement proper error handling for media data storage failures
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 6. Update streaming session service layer

  - Modify habitats service to validate and process media data
  - Update createStream service method to handle media information
  - Add validation for TMDB IDs and media types
  - Implement business logic for optional media association
  - _Requirements: 2.1, 2.2, 6.3_

- [x] 7. Enhance StreamCard component

  - Update StreamCard to display media poster images
  - Add media title and type display with proper styling
  - Implement fallback images for missing or failed poster loads
  - Add release year and media type badges
  - Ensure responsive design for mobile and desktop viewing
  - Update component props interface to include media information
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.4, 7.4_

- [ ] 8. Update streaming session types and schemas

  - Add media-related TypeScript interfaces to habitats.types.ts
  - Update Zod validation schemas for streaming session creation with media fields
  - Create SelectedMedia and StreamMedia type definitions
  - Update CreateStreamData interface to include media fields
  - Ensure type safety across all components using media data
  - _Requirements: 2.1, 2.2_

- [ ] 9. Implement error handling and fallbacks

  - Add comprehensive error handling for TMDB API failures
  - Implement graceful degradation when media search is unavailable
  - Create fallback UI states for failed image loads and API errors
  - Add retry mechanisms for failed search requests
  - Ensure streaming session creation works regardless of media search state
  - Add user-friendly error messages following brand voice
  - _Requirements: 4.4, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 10. Create comprehensive test suite

  - Write unit tests for TMDB service with mocked API responses
  - Create tests for MediaSearchField component interactions and state management
  - Add tests for enhanced StreamCard with media display scenarios
  - Write integration tests for streaming session creation with media selection
  - Test error scenarios and fallback behaviors
  - Add visual regression tests for responsive design
  - _Requirements: All requirements - comprehensive testing coverage_

- [ ] 11. Update streaming session carousel and list displays

  - Modify StreamingCarousel to show enhanced cards with media
  - Update any other streaming session list components to display media information
  - Ensure consistent media display across all streaming session UI components
  - Test carousel performance with image loading
  - _Requirements: 3.1, 3.2, 3.3, 7.4_

- [ ] 12. Performance optimization and caching

  - Implement search result caching with appropriate TTL
  - Add image lazy loading for streaming session cards
  - Optimize TMDB image sizes for different display contexts
  - Implement request throttling to prevent API abuse
  - Add performance monitoring for search and image loading
  - _Requirements: 4.1, 4.6_

- [ ] 13. Mobile responsiveness and accessibility

  - Ensure media search works smoothly on mobile devices
  - Test touch interactions for search results selection
  - Verify keyboard navigation and screen reader compatibility
  - Optimize image sizes and loading for mobile networks
  - Test responsive design across different screen sizes
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 14. Integration testing and bug fixes

  - Test complete flow from media search to streaming session creation
  - Verify media display in all streaming session UI components
  - Test edge cases like network failures and invalid media data
  - Fix any bugs discovered during integration testing
  - Ensure backward compatibility with existing streaming sessions
  - _Requirements: All requirements - end-to-end validation_

- [ ] 15. Implement stream participants database layer

  - Create migration script for stream_participants table
  - Add stream_messages table for chat functionality
  - Update habitat_watch_parties table with playback state columns
  - Create repository methods for participant management (join, leave, list)
  - Implement chat message storage and retrieval methods
  - Add proper indexes and foreign key constraints
  - _Requirements: 6.2, 6.5, 9.4, 9.5_

- [ ] 16. Implement stream join/leave functionality

  - Create service methods for joining and leaving streams
  - Add participant validation and duplicate prevention
  - Implement host assignment logic for first participant
  - Create reminder toggle functionality
  - Add real-time participant updates using Supabase realtime
  - Handle edge cases like stream deletion while user is participant
  - _Requirements: 6.1, 6.2, 6.5, 7.5_

- [ ] 17. Update StreamCard with join functionality and menu

  - Add Join button for non-participants with loading states
  - Implement three-dots menu button using Shadcn DropdownMenu component
  - Create menu options based on user participation status
  - Add participant count display and visual indicators
  - Implement join/leave actions with optimistic updates
  - Add reminder toggle functionality in menu
  - Style components according to design system guidelines
  - _Requirements: 6.1, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 7.6_

- [ ] 18. Create video player component

  - Build StreamingVideoPlayer component with HTML5 video element
  - Implement custom video controls with play/pause/seek functionality
  - Add fullscreen support and responsive design
  - Create loading and error states for media playback
  - Implement playback synchronization logic for multiple participants
  - Add host-only controls and participant view-only mode
  - Handle different media types (movie vs TV show episodes)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 19. Implement stream page layout

  - Create new stream page layout with video player and sidebar
  - Build responsive design that works on desktop, tablet, and mobile
  - Implement collapsible sidebar for mobile devices
  - Add proper spacing and visual hierarchy
  - Ensure video player takes appropriate screen real estate
  - Handle different screen orientations and sizes
  - _Requirements: 9.1, 9.6, 9.7, 10.6, 10.7_

- [ ] 20. Create participants sidebar component

  - Build ParticipantsSidebar component with real-time participant list
  - Display participant avatars, names, and host indicators
  - Implement real-time updates when participants join/leave
  - Add host controls for managing participants (if needed)
  - Style component according to design system
  - Handle empty states and loading states
  - _Requirements: 9.2, 9.4_

- [ ] 21. Implement stream chat functionality

  - Create StreamChat component with message input and display
  - Implement real-time messaging using Supabase realtime subscriptions
  - Add message history loading and pagination
  - Create message bubbles with user avatars and timestamps
  - Add typing indicators and message status
  - Implement proper error handling for message sending
  - Style chat interface according to design system
  - _Requirements: 9.3, 9.5_

- [ ] 22. Add playback synchronization

  - Implement real-time playback state synchronization
  - Create host controls that broadcast to all participants
  - Add participant sync when joining mid-session
  - Handle network issues and reconnection scenarios
  - Implement buffering coordination across participants
  - Add conflict resolution for simultaneous control actions
  - _Requirements: 8.4, 8.5, 8.6, 8.7_

- [ ] 23. Update stream service layer for new functionality

  - Add service methods for participant management
  - Implement chat message handling in service layer
  - Create playback state management methods
  - Add validation for join/leave operations
  - Implement business logic for host assignment and permissions
  - Add error handling for all new service operations
  - _Requirements: 6.2, 6.5, 7.5, 8.4, 9.4, 9.5_

- [ ] 24. Mobile optimization and responsive design

  - Optimize video player for mobile touch controls
  - Implement mobile-friendly sidebar (bottom sheet or overlay)
  - Ensure join/leave functionality works well on touch devices
  - Test menu interactions on mobile devices
  - Optimize chat interface for mobile keyboards
  - Add proper viewport handling for video fullscreen
  - Test across different mobile screen sizes and orientations
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [ ] 25. Comprehensive testing for new features

  - Write unit tests for participant management functionality
  - Create tests for video player component and playback sync
  - Add integration tests for join/leave workflow
  - Test chat functionality with real-time updates
  - Create tests for responsive design and mobile interactions
  - Add error scenario testing for network failures
  - Test concurrent user interactions and edge cases
  - _Requirements: All new requirements - comprehensive testing coverage_

- [ ] 26. Documentation and cleanup
  - Update component documentation with new media functionality
  - Create Storybook stories for MediaSearchField and enhanced StreamCard
  - Document TMDB service usage and configuration
  - Add documentation for video player and chat components
  - Document participant management and playback sync features
  - Clean up any unused imports or temporary code
  - Update README with new environment variable requirements
  - _Requirements: Supporting documentation for all implemented features_
