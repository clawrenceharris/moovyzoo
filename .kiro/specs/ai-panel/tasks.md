# Implementation Plan

- [X] 1. Set up project structure and dependencies
  - Install LangGraph.js and related dependencies
  - Create directory structure for AI sidebar feature
  - Set up TypeScript interfaces and types for sidebar functionality
  - Update globals.css with any additional brand color utilities needed
  - _Requirements: 7.1, 7.2_

- [X] 2. Implement core data models and validation
  - Create Message, ChatState, and StarterPrompt interfaces
  - Implement Zod schemas for message and image validation
  - Create utility functions for message formatting
  - _Requirements: 3.1, 4.2, 4.5_ 

- [X] 3. Create LangGraph.js integration layer
  - Set up LangGraph.js configuration and API connection
  - Implement conversation workflow for text and image processing
  - Create error handling and retry mechanisms
  - Write unit tests for LangGraph integration
  - _Requirements: 5.1, 5.2, 5.4, 7.3, 7.4, 7.5_

- [X] 4. Build core sidebar and FAB components
  - [ ] 4.1 Create AIChatFAB component
    - Implement floating action button with brand red styling
    - Add fixed positioning and responsive sizing
    - Include hover effects and rotation animation
    - Add proper accessibility attributes
    - Write component tests
    - _Requirements: 1.1, 1.2, 6.6_

  - [X] 4.2 Create AIChatSidebar component with overlay
    - Implement sidebar container with backdrop overlay
    - Add slide-in/out animations (desktop: from right, mobile: full-screen)
    - Include click-outside-to-close functionality
    - Add escape key handling
    - Use brand colors for theming
    - Write component tests
    - _Requirements: 1.3, 1.4, 6.1, 6.2, 6.4_

  - [X] 4.3 Create MessageBubble component for individual messages
    - Implement user vs AI message styling with brand colors
    - Add support for text and image content display
    - Include timestamp and copy functionality
    - Use brand blue for AI messages, appropriate contrast for user messages
    - Write component tests
    - _Requirements: 3.4, 5.3, 6.4_

  - [X] 4.4 Create MessageList component for conversation history
    - Implement scrollable message container within sidebar
    - Add auto-scroll to bottom functionality
    - Include loading indicator for AI responses
    - Optimize for sidebar width constraints
    - Write component tests
    - _Requirements: 3.5, 5.2_

  - [X] 4.5 Create TypingIndicator component for AI loading state
    - Implement animated typing indicator with brand colors
    - Add proper accessibility labels
    - Write component tests
    - _Requirements: 5.2_

- [X] 5. Implement chat input functionality
  - [ ] 5.1 Create ChatInput component with text input
    - Build multi-line text input with auto-resize
    - Add character count and validation
    - Implement keyboard shortcuts (Enter to send, Shift+Enter for new line)
    - Write component tests
    - _Requirements: 3.1, 3.2, 3.3_

  - [X] 5.2 Add image attachment support to ChatInput
    - Implement file picker and drag-and-drop functionality
    - Add image validation (format, size)
    - Create image preview with removal option
    - Write tests for image handling
    - _Requirements: 4.1, 4.2, 4.3, 4.6_

  - [X] 5.3 Create image processing utilities
    - Implement image compression and resizing
    - Add image format validation
    - Create error handling for invalid images
    - Write utility function tests
    - _Requirements: 4.5_

- [X] 6. Build starter prompts functionality
  - Create StarterPrompts component with categorized prompts
  - Implement prompt selection and input population
  - Add responsive grid layout for different screen sizes
  - Write component tests
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [X] 7. Create main chat interface container
  - Build ChatInterface component that orchestrates all chat functionality within sidebar
  - Implement chat state management with custom hooks
  - Add responsive layout optimized for sidebar constraints
  - Integrate with sidebar state management
  - Write integration tests for complete chat flow
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [X] 8. Implement chat and sidebar state management hooks
  - [ ] 8.1 Create useChatSidebar hook for sidebar state
    - Manage sidebar open/close state
    - Handle animations and transitions
    - Implement keyboard and click-outside handling
    - Persist sidebar preferences in localStorage
    - Write hook tests
    - _Requirements: 1.2, 1.3, 1.4_

  - [X] 8.2 Create useChat hook for conversation state
    - Manage messages array and conversation state
    - Handle message sending and receiving
    - Implement error state management
    - Integrate with sidebar state
    - Write hook tests
    - _Requirements: 3.1, 3.2, 3.3, 5.1_

  - [X] 8.3 Create useLangGraph hook for AI integration
    - Integrate with LangGraph.js workflows
    - Handle text and image message processing
    - Implement conversation context management
    - Write hook tests
    - _Requirements: 5.1, 5.5, 7.3, 7.4, 7.5_

  - [X] 8.4 Create useImageUpload hook for file handling
    - Handle image file selection and validation
    - Implement image preview and removal
    - Add error handling for upload failures
    - Write hook tests
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_

- [X] 9. Integrate AI chat sidebar globally
  - Add AIChatFAB and AIChatSidebar to root layout
  - Ensure sidebar is accessible from all pages
  - Implement proper z-index layering
  - Add global state management for sidebar
  - Implement error boundaries for the sidebar
  - Write integration tests
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [X] 10. Add responsive design and accessibility
  - Implement mobile-first responsive design
  - Add proper ARIA labels and semantic HTML
  - Ensure keyboard navigation support
  - Test with screen readers
  - Write accessibility tests
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [X] 11. Implement error handling and edge cases
  - Add comprehensive error boundaries
  - Implement retry mechanisms for failed requests
  - Handle network connectivity issues
  - Add graceful degradation for service unavailability
  - Write error scenario tests
  - _Requirements: 5.4, 7.4_

- [X] 12. Add performance optimizations
  - Implement message virtualization for long conversations
  - Add image lazy loading and compression
  - Optimize bundle size and code splitting
  - Add performance monitoring
  - Write performance tests
  - _Requirements: 3.5, 4.5_