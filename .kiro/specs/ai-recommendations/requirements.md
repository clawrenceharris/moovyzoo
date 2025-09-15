# Requirements Document

## Introduction

This feature implements an AI-powered recommendation system that suggests both content (movies and TV shows) and potential friends to users based on their preferences, viewing history, and social connections. The system will display personalized recommendations as UI cards on the home page, providing users with intelligent suggestions to enhance their Zoovie experience.

The recommendation system consists of two main components: a Content Recommendation Agent that suggests movies and TV shows, and a Friend Suggestion Agent that identifies users with similar tastes. Both agents will use explainable AI techniques to provide transparent reasoning for their suggestions.

## Requirements

### Requirement 1: Content Recommendation System

**User Story:** As a Zoovie user, I want to receive personalized movie and TV show recommendations based on my preferences and viewing history, so that I can discover new content that matches my taste.

#### Acceptance Criteria

1. WHEN a user logs in THEN the system SHALL generate content recommendations based on their profile data
2. WHEN generating recommendations THEN the system SHALL use favorite_genres, favorite_titles, and watch_history data from the user's profile
3. WHEN calculating recommendations THEN the system SHALL weight recent watches higher than older ones using watched_at timestamps
4. WHEN scoring content THEN the system SHALL normalize user ratings from 1-10 scale to 0.1-1.0 for consistent weighting
5. WHEN generating candidates THEN the system SHALL use TMDB discover, similar, and recommendations APIs with batch metadata calls
6. WHEN scoring recommendations THEN the system SHALL provide explainable match scores from 0-100 with breakdown rationales
7. WHEN displaying recommendations THEN the system SHALL show match_score as percentage and short_explanation for each item
8. WHEN no viewing history exists THEN the system SHALL fall back to favorite_genres and favorite_titles from user profiles
9. WHEN TMDB APIs fail THEN the system SHALL provide fallback recommendations using popular content in user's top genres

### Requirement 2: Friend Suggestion System

**User Story:** As a Zoovie user, I want to discover other users with similar movie and TV show preferences, so that I can connect with like-minded people and expand my social network.

#### Acceptance Criteria

1. WHEN generating friend suggestions THEN the system SHALL only consider public profiles where is_public = true
2. WHEN calculating friend matches THEN the system SHALL exclude current user and existing friends with status = 'accepted'
3. WHEN scoring potential friends THEN the system SHALL use overlap in favorite_titles, favorite_genres, and mutual high-rated content
4. WHEN calculating taste_match_score THEN the system SHALL weight shared_high_rated_titles at 60%, shared_genres at 25%, and activity at 15%
5. WHEN displaying friend suggestions THEN the system SHALL show taste_match_score and short_rationale for each suggestion
6. WHEN users have mutual high ratings THEN the system SHALL highlight titles both users rated 8/10 or higher
7. WHEN users share habitats THEN the system SHALL include habitat membership in the matching algorithm
8. WHEN building rationales THEN the system SHALL create one-line explanations like "Also gave Parasite & Whiplash 9/10"

### Requirement 3: Session-Based Caching System

**User Story:** As a Zoovie user, I want my recommendations to load quickly and remain consistent during my session, so that I have a smooth browsing experience without repeated loading delays.

#### Acceptance Criteria

1. WHEN a user logs in THEN the system SHALL generate recommendations once and cache them for the session
2. WHEN recommendations are cached THEN the system SHALL store them in session memory or ephemeral database table
3. WHEN a user clicks "New Recommendations" THEN the system SHALL regenerate and update cached recommendations
4. WHEN accessing cached recommendations THEN the system SHALL return results without re-querying TMDB APIs
5. WHEN session expires THEN the system SHALL clear cached recommendations and regenerate on next login
6. WHEN caching fails THEN the system SHALL generate recommendations in real-time as fallback

### Requirement 4: Homepage Integration

**User Story:** As a Zoovie user, I want to see my personalized recommendations prominently displayed on my home page, so that I can quickly discover new content and potential friends when I visit the platform.

#### Acceptance Criteria

1. WHEN a user visits the home page THEN the system SHALL display content recommendations as cards
2. WHEN displaying content cards THEN each card SHALL show title, poster, match_score, and short_explanation
3. WHEN displaying friend suggestion cards THEN each card SHALL show display_name, avatar, taste_match_score, and rationale
4. WHEN recommendations are loading THEN the system SHALL show appropriate loading states
5. WHEN recommendations fail to load THEN the system SHALL display error states with retry options
6. WHEN no recommendations are available THEN the system SHALL show empty states with guidance
7. WHEN a user clicks a content card THEN the system SHALL navigate to detailed content view
8. WHEN a user clicks a friend card THEN the system SHALL navigate to the user's profile page

### Requirement 5: Database Schema Extensions

**User Story:** As a system administrator, I want the database to support watch history and friend relationships, so that the recommendation algorithms have sufficient data to generate accurate suggestions.

#### Acceptance Criteria

1. WHEN implementing the system THEN there SHALL be a watch_history table with user_id, movie_id, title, poster_url, media_type, status, rating, watched_at columns
2. WHEN implementing the system THEN there SHALL be a friends table with requester_id, receiver_id, status, created_at, updated_at columns
3. WHEN querying watch history THEN the system SHALL use idx_watch_history_user_recent index for performance
4. WHEN querying friends THEN the system SHALL use idx_friends_* indices for efficient lookups
5. WHEN storing ratings THEN the system SHALL enforce 1-10 integer scale with proper validation
6. WHEN storing friend status THEN the system SHALL enforce 'pending', 'accepted', 'blocked' enum values
7. WHEN creating unique constraints THEN there SHALL be one watch_history row per user+movie_id combination

### Requirement 6: Privacy and Security Controls

**User Story:** As a Zoovie user, I want my privacy to be respected in the recommendation system, so that my personal data is only used appropriately and I have control over my visibility to others.

#### Acceptance Criteria

1. WHEN generating friend suggestions THEN the system SHALL only include users with is_public = true
2. WHEN accessing user data THEN the system SHALL respect privacy settings and profile visibility controls
3. WHEN displaying friend suggestions THEN the system SHALL not reveal private information about suggested users
4. WHEN a user sets profile to private THEN they SHALL be excluded from friend suggestion pools
5. WHEN processing recommendations THEN the system SHALL not store or log sensitive personal information
6. WHEN friend relationships exist THEN the system SHALL only consider status = 'accepted' as valid friendships

### Requirement 7: Performance and Monitoring

**User Story:** As a system administrator, I want the recommendation system to perform efficiently and provide monitoring capabilities, so that I can ensure good user experience and system reliability.

#### Acceptance Criteria

1. WHEN making TMDB API calls THEN the system SHALL batch requests using append_to_response parameter
2. WHEN generating recommendations THEN the system SHALL complete processing within 5 seconds for typical user profiles
3. WHEN database queries execute THEN the system SHALL use appropriate indices for sub-second response times
4. WHEN TMDB rate limits are hit THEN the system SHALL implement exponential backoff and fallback strategies
5. WHEN monitoring the system THEN there SHALL be logging of TMDB call counts and fallback events
6. WHEN errors occur THEN the system SHALL log detailed error information for debugging
7. WHEN system load is high THEN cached recommendations SHALL be prioritized over real-time generation