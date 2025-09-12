# Streaming Session Media Integration - Requirements Document

## Introduction

This feature enables users to search for and select movies or TV shows from The Movie Database (TMDB) when creating streaming sessions. The selected media will be associated with the streaming session and displayed with rich visual content including poster images, titles, and metadata. This transforms streaming sessions from generic events into visually appealing, content-specific gatherings that help users understand what they're joining.

## Requirements

### Requirement 1: Media Search in Streaming Session Creation

**User Story:** As a user creating a streaming session, I want to search for movies and TV shows so that I can associate specific content with my streaming session.

#### Acceptance Criteria

1. WHEN creating a streaming session THEN the form SHALL include a media search field
2. WHEN I type in the search field THEN the system SHALL search TMDB for movies and TV shows matching my query
3. WHEN search results are returned THEN the system SHALL display them with poster images, titles, release years, and media type (movie/TV)
4. WHEN I select a media item THEN it SHALL be associated with the streaming session and the search field SHALL show the selected item
5. WHEN I clear the selection THEN the system SHALL allow me to search again
6. IF no media is selected THEN the system SHALL prevent form submission without a media selection

### Requirement 2: Media Data Storage and Retrieval

**User Story:** As a system, I need to store media information with streaming sessions so that I can display rich content in the UI.

#### Acceptance Criteria

1. WHEN a streaming session is created with selected media THEN the system SHALL store the TMDB media ID, media type (movie/tv), media title, party title, poster path, runtime, and release date
2. WHEN retrieving streaming sessions THEN the system SHALL include the associated media information
3. WHEN media information is missing or invalid THEN the system SHALL gracefully handle the absence without breaking the streaming session functionality
4. WHEN displaying streaming sessions THEN the system SHALL construct proper TMDB image URLs for poster display

### Requirement 3: Enhanced Streaming Session Card Display

**User Story:** As a user browsing streaming sessions, I want to see movie/TV show posters, runtime length, and titles so that I can quickly identify what content is being watched.

#### Acceptance Criteria

1. WHEN a streaming session has associated media THEN the streaming session card SHALL display the movie/TV poster image
2. WHEN a streaming session has associated media THEN the card SHALL show the media title
3. WHEN a streaming session has no associated media THEN the card SHALL display a default placeholder or icon
4. WHEN poster images fail to load THEN the system SHALL show a fallback image or placeholder
5. WHEN displaying media information THEN the system SHALL show release year and title and runtime only

### Requirement 4: Search Performance and User Experience

**User Story:** As a user searching for media, I want fast and relevant results so that I can quickly find and select the content I want to watch.

#### Acceptance Criteria

1. WHEN I type in the search field THEN the system SHALL debounce requests to avoid excessive API calls
2. WHEN searching THEN the system SHALL show loading indicators during the search process
3. WHEN search results are empty THEN the system SHALL display a helpful "No results found" message
4. WHEN search fails THEN the system SHALL show an error message and allow retry
5. WHEN I type fewer than 3 characters THEN the system SHALL NOT trigger a search
6. WHEN search results are displayed THEN they SHALL be limited to a reasonable number (10-15 items) for performance

### Requirement 5: Database Schema Updates

**User Story:** As a system administrator, I need the database to support media associations so that streaming sessions can store and retrieve media information.

#### Acceptance Criteria

1. WHEN the system is updated THEN the habitat_watch_parties table SHALL include columns for tmdb_id, media_type, media_title, poster_path, and release_date and runtime
2. WHEN these columns are added THEN existing streaming sessions SHALL continue to function with NULL media values
3. WHEN querying streaming sessions THEN the media information SHALL be included in the response
4. WHEN creating streaming sessions THEN the media fields SHALL be optional and nullable
5. WHEN creating streaming sessions THEN the system SHALL accept NULL values for streaming session fields and require a valid tmdb_id for media selection

### Requirement 6: Stream Card Join Functionality

**User Story:** As a user browsing streaming sessions, I want to join or leave streams directly from the card so that I can quickly participate in watch parties.

#### Acceptance Criteria

1. WHEN viewing a streaming session card THEN the card SHALL display a prominent "Join" button if I'm not a participant
2. WHEN I click the "Join" button THEN the system SHALL add me to the streaming session participants
3. WHEN I'm already a participant THEN the card SHALL show my participation status
4. WHEN joining a stream THEN the system SHALL provide immediate feedback of successful participation
5. WHEN joining fails THEN the system SHALL display an appropriate error message and allow retry

### Requirement 7: Stream Card Menu Options

**User Story:** As a user interacting with streaming sessions, I want access to additional options through a menu so that I can manage my participation and preferences.

#### Acceptance Criteria

1. WHEN viewing a streaming session card THEN the card SHALL display a three-dots menu button in the top-right corner
2. WHEN I click the menu button THEN the system SHALL show a dropdown menu with relevant options
3. WHEN I'm not a participant THEN the menu SHALL show "Join" and "Set Reminder" options
4. WHEN I'm a participant THEN the menu SHALL show "Leave" and "Toggle Reminder" options
5. WHEN I select "Leave" THEN the system SHALL remove me from the streaming session participants
6. WHEN I select "Set Reminder" or "Toggle Reminder" THEN the system SHALL manage my reminder preferences for the session
7. WHEN I click outside the menu THEN the dropdown SHALL close automatically

### Requirement 8: Video Player Implementation

**User Story:** As a user in a streaming session, I want to watch the selected media with synchronized playback so that I can enjoy content together with other participants.

#### Acceptance Criteria

1. WHEN I enter a streaming session page THEN the system SHALL display a video player for the selected media
2. WHEN the media is a movie THEN the player SHALL load the full movie content
3. WHEN the media is a TV show THEN the player SHALL load the appropriate episode
4. WHEN playback controls are used THEN the system SHALL synchronize playback state with all participants
5. WHEN I join mid-session THEN the player SHALL sync to the current playback position
6. WHEN the host pauses or plays THEN all participants' players SHALL reflect the same state
7. WHEN network issues occur THEN the player SHALL handle buffering gracefully without breaking sync

### Requirement 9: Stream Page Layout with Sidebar

**User Story:** As a user in a streaming session, I want to see participants and chat alongside the video so that I can interact with others while watching.

#### Acceptance Criteria

1. WHEN viewing a streaming session page THEN the layout SHALL show the video player as the main content area
2. WHEN viewing the page THEN a sidebar SHALL display the list of current participants
3. WHEN viewing the page THEN the sidebar SHALL include a chat interface for real-time messaging
4. WHEN new participants join THEN the participants list SHALL update in real-time
5. WHEN messages are sent THEN they SHALL appear immediately in the chat for all participants
6. WHEN on mobile THEN the sidebar SHALL be collapsible or overlay to preserve video viewing space
7. WHEN the sidebar is collapsed THEN there SHALL be indicators for new messages and participant changes

### Requirement 10: Mobile and Responsive Design

**User Story:** As a mobile user, I want the media search, stream cards, and video player to work smoothly on my device so that I can participate in streaming sessions anywhere.

#### Acceptance Criteria

1. WHEN using the search on mobile THEN the interface SHALL be touch-friendly and responsive
2. WHEN viewing search results on mobile THEN they SHALL be properly sized and scrollable
3. WHEN selecting media on mobile THEN the interaction SHALL be clear and accessible
4. WHEN viewing streaming session cards on mobile THEN the media images and controls SHALL scale appropriately
5. WHEN the keyboard is open THEN the search interface SHALL remain usable and visible
6. WHEN viewing the video player on mobile THEN it SHALL support fullscreen mode and touch controls
7. WHEN using the sidebar on mobile THEN it SHALL be optimized for touch interaction and small screens
