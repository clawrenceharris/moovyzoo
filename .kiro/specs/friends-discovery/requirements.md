# Requirements Document

## Introduction

The Friends Discovery feature enables users to connect with other MoovyZoo users by viewing public profiles, sending friend requests, and building a social network within the platform. This feature transforms MoovyZoo from a solo viewing experience into a social platform where users can discover like-minded movie and TV enthusiasts, share their viewing preferences, and build connections based on shared interests.

The feature includes profile discovery, friend request management, watch history tracking, and enhanced profile pages that showcase user preferences and viewing activity.

## Requirements

### Requirement 1

**User Story:** As a MoovyZoo user, I want to discover other users with similar movie and TV interests, so that I can connect with like-minded viewers and expand my social network.

#### Acceptance Criteria

1. WHEN I navigate to the discover page THEN the system SHALL display a list of public user profiles excluding my own profile
2. WHEN viewing the discover page THEN the system SHALL show each user's display name, avatar, favorite genres, and 2-3 favorite titles
3. WHEN I view a user's profile card on discover THEN the system SHALL provide "View Profile" and "Add Friend" buttons
4. IF a user has already been sent a friend request THEN the system SHALL show "Request Sent" instead of "Add Friend"
5. IF a user is already my friend THEN the system SHALL show "Friends" instead of "Add Friend"

### Requirement 2

**User Story:** As a user, I want to send friend requests to other users, so that I can build connections with people who share my viewing interests.

#### Acceptance Criteria

1. WHEN I click "Add Friend" on a user's profile THEN the system SHALL create a friend request with status "pending"
2. WHEN I send a friend request THEN the system SHALL store the requester_id, receiver_id, and timestamp
3. WHEN a friend request is sent THEN the system SHALL update the button to show "Request Sent"
4. WHEN I try to send a friend request to the same user twice THEN the system SHALL prevent duplicate requests
5. IF the friend request fails THEN the system SHALL display an appropriate error message

### Requirement 3

**User Story:** As a user, I want to receive and manage friend requests, so that I can control who I connect with on the platform.

#### Acceptance Criteria

1. WHEN I receive a friend request THEN the system SHALL display a friend request notification icon in the header
2. WHEN I click the friend request icon THEN the system SHALL open a modal showing all pending friend requests
3. WHEN viewing a friend request THEN the system SHALL show the requester's name, avatar, and "Accept" and "Decline" buttons
4. WHEN I accept a friend request THEN the system SHALL update the status to "accepted" and add both users as friends
5. WHEN I decline a friend request THEN the system SHALL remove the request from the pending list
6. WHEN I have no pending requests THEN the system SHALL hide the friend request notification icon

### Requirement 4

**User Story:** As a user, I want to view detailed profiles of other users, so that I can learn more about their viewing preferences before sending a friend request.

#### Acceptance Criteria

1. WHEN I click "View Profile" on a user's card THEN the system SHALL navigate to their full profile page
2. WHEN viewing another user's profile THEN the system SHALL display their display name, avatar, bio, favorite genres, and favorite titles
3. WHEN viewing another user's profile THEN the system SHALL show an "Add Friend" button if we're not connected
4. WHEN viewing a friend's profile THEN the system SHALL display "Friends" status instead of "Add Friend"
5. IF the user's profile is private THEN the system SHALL show limited information and no friend request option

### Requirement 5

**User Story:** As a user, I want to track my watch history, so that I can remember what I've watched and share my viewing activity with friends.

#### Acceptance Criteria

1. WHEN I mark a movie or show as watched THEN the system SHALL record it in my watch history with timestamp
2. WHEN I rate a movie or show THEN the system SHALL store the rating with my watch history entry
3. WHEN I view my own profile THEN the system SHALL display my recent watch history
4. WHEN friends view my profile THEN the system SHALL show my recent watch activity if my profile is public
5. WHEN I update my watch status THEN the system SHALL allow me to change between "watched", "watching", and "dropped"

### Requirement 6

**User Story:** As a user, I want to manage my friends list, so that I can see all my connections and interact with them.

#### Acceptance Criteria

1. WHEN I navigate to my friends list THEN the system SHALL display all users with "accepted" friend status
2. WHEN viewing my friends list THEN the system SHALL show each friend's name, avatar, and last activity
3. WHEN I click on a friend THEN the system SHALL navigate to their profile page
4. WHEN viewing my friends list THEN the system SHALL provide options to message or remove friends
5. IF I have no friends THEN the system SHALL display an empty state encouraging me to discover users

### Requirement 7

**User Story:** As a user, I want to control my profile privacy, so that I can decide who can see my information and send me friend requests.

#### Acceptance Criteria

1. WHEN I set my profile to public THEN the system SHALL make my profile discoverable to all users
2. WHEN I set my profile to private THEN the system SHALL hide my profile from the discover page
3. WHEN my profile is public THEN the system SHALL display my favorite genres, titles, and recent activity
4. WHEN my profile is private THEN the system SHALL only show basic information to non-friends
5. WHEN I change privacy settings THEN the system SHALL immediately update my discoverability status

### Requirement 8

**User Story:** As a user, I want to see friend suggestions based on shared interests, so that I can easily find users with similar viewing preferences.

#### Acceptance Criteria

1. WHEN I view the discover page THEN the system SHALL prioritize users with similar favorite genres
2. WHEN displaying user suggestions THEN the system SHALL highlight shared favorite titles or genres
3. WHEN I have many genre matches with a user THEN the system SHALL show "Similar interests" indicator
4. WHEN sorting discover results THEN the system SHALL rank users by compatibility score
5. IF no users match my interests THEN the system SHALL show all public profiles in random order