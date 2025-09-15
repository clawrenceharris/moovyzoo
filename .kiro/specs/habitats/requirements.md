# Requirements Document

## Introduction

Habitats are social spaces within MoovyZoo surrounding a specifc movie or show where users can gather to discuss the movie/show, participate in interactive activities, and connect with like-minded fans. These spaces serve as the core community feature, transforming passive viewing into active social engagement through chat, polls, trivia, and AI-driven discussion prompts.

## Requirements

### Requirement 1

**User Story:** As a movie/TV enthusiast, I want to see all my currently joined habitats, so that I can continue interacting with members who share my interests in specific genres or fandoms.

#### Acceptance Criteria

1. WHEN a user visits the habitats page THEN the system SHALL display a list of habitat cards that the user has joined.
2. WHEN a user views a habitat card THEN the system SHALL show the habitat name, tags, member count, and recent activity indicator
3. WHEN a user clicks on a habitat card THEN the system SHALL navigate them to that habitat's dashboard page

### Requirement 2

**User Story:** As a movie/TV enthusiast, I want to create a new habitat for a specific movie, show, or genre, so that I can start a community space for discussions and activities around content I'm passionate about.

#### Acceptance Criteria

1. WHEN a user clicks the "Create Habitat" button THEN the system SHALL display a habitat creation form
2. WHEN a user fills out the habitat creation form THEN the system SHALL require a habitat name, description, and at least one tag
3. WHEN a user submits a valid habitat creation form THEN the system SHALL create the new habitat with the user as the owner
4. WHEN a habitat is successfully created THEN the system SHALL automatically add the creator as the first member and navigate them to the new habitat
5. WHEN a user creates a habitat THEN the system SHALL allow them to set the habitat as public or private
6. WHEN a user creates a habitat THEN the system SHALL allow them to add up to 5 relevant tags for discoverability

### Requirement 3

**User Story:** As a habitat member, I want to view a central dashboard for each habitat, so that I can see an overview of all activities, discussions, and events happening in that community space.

#### Acceptance Criteria

1. WHEN a user visits a habitat page THEN the system SHALL display a central dashboard with habitat branding and overview
2. WHEN a user views the habitat dashboard THEN the system SHALL show a hero section with habitat name, description, and primary action buttons
3. WHEN a user views the habitat dashboard THEN the system SHALL display popular ongoing discussions and polls
4. WHEN a user views the habitat dashboard THEN the system SHALL show upcoming or current streaming sessions with join options
5. WHEN a user views the habitat dashboard THEN the system SHALL display habitat metadata including creation date, tags, and member statistics
6. WHEN a user views the habitat dashboard THEN the system SHALL show ongoing events like trivia nights or polls
7. WHEN a user views the habitat dashboard THEN the system SHALL display current online members and total member count

### Requirement 4

**User Story:** As a habitat member, I want to navigate to specific chat rooms from the habitat dashboard, so that I can participate in focused discussions on particular topics.

#### Acceptance Criteria

1. WHEN a user clicks on a discussion from the dashboard THEN the system SHALL navigate them to the specific discussion room (or discussion room) at `/habitats/:habitatId/discussions/:discussionId`
2. WHEN a user enters a specific discussion room THEN the system SHALL display the real-time chat interface for that room
3. WHEN a user types a message in a discussion room THEN the system SHALL send it to all active members in that room in real-time
4. WHEN a user sends a message THEN the system SHALL display their profile picture, display name or username, and timestamp
5. WHEN a user scrolls up in chat THEN the system SHALL load previous message history for that specific discussion room

### Requirement 5

**User Story:** As a habitat member, I want to start streaming streams and create polls from the habitat dashboard, so that I can initiate interactive activities with other community members.

#### Acceptance Criteria

1. WHEN a user clicks "Start Streaming Stream" on the habitat dashboard THEN the system SHALL initiate a streaming session creation flow
2. WHEN a user clicks "Create Poll" on the habitat dashboard THEN the system SHALL display a poll creation interface
3. WHEN a user creates a poll THEN the system SHALL add it to the "Popular in this habitat" section for other members to participate
4. WHEN a user joins a streaming party THEN the system SHALL add them to the synchronized viewing session

### Requirement 6

**User Story:** As a habitat member, I want to create new discussions within a habitat, so that I can start focused conversations on specific topics with other community members.

#### Acceptance Criteria

1. WHEN a user clicks "Create Discussion" or similar action THEN the system SHALL display a discussion creation form
2. WHEN a user fills out the discussion creation form THEN the system SHALL require a discussion name and allow an optional description
3. WHEN a user submits a valid discussion creation form THEN the system SHALL create the new discussion and add it to the habitat
4. WHEN a discussion is successfully created THEN the system SHALL navigate the user to the new discussion room
5. WHEN a user creates a discussion THEN the system SHALL validate the discussion name is between 3-100 characters
6. WHEN a user creates a discussion THEN the system SHALL validate the description is no more than 500 characters if provided

### Requirement 7

**User Story:** As a habitat member, I want to create polls within a habitat, so that I can gather opinions and engage the community in decision-making activities.

#### Acceptance Criteria

1. WHEN a user clicks "Create Poll" THEN the system SHALL display a poll creation form
2. WHEN a user fills out the poll creation form THEN the system SHALL require a poll title and at least 2 poll options
3. WHEN a user creates poll options THEN the system SHALL allow up to 6 options with each option being 1-100 characters
4. WHEN a user submits a valid poll creation form THEN the system SHALL create the new poll and add it to the habitat
5. WHEN a poll is successfully created THEN the system SHALL display it in the "Popular in this habitat" section
6. WHEN a user creates a poll THEN the system SHALL validate the poll title is between 5-200 characters
7. WHEN a user creates a poll THEN the system SHALL allow adding and removing poll options dynamically

### Requirement 8

**User Story:** As a habitat member, I want to create streaming sessions within a habitat, so that I can schedule synchronized viewing sessions with other community members.

#### Acceptance Criteria

1. WHEN a user clicks "Start Streaming Stream" THEN the system SHALL display a streaming session creation form
2. WHEN a user fills out the streaming session creation form THEN the system SHALL require a party title, scheduled time, and optional description
3. WHEN a user sets a scheduled time THEN the system SHALL validate the time is in the future
4. WHEN a user submits a valid streaming session creation form THEN the system SHALL create the new streaming session and add it to the habitat
5. WHEN a streaming session is successfully created THEN the system SHALL display it in the streaming sessions section
6. WHEN a user creates a streaming session THEN the system SHALL validate the party title is between 5-200 characters
7. WHEN a user creates a streaming session THEN the system SHALL allow setting an optional maximum participant limit
8. WHEN a user creates a streaming session THEN the system SHALL automatically add the creator as the first participant
