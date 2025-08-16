# Requirements Document — MoovyZoo

## Introduction

The Auth, Profiles, and Social Features of **MoovyZoo** enable fans to discover, discuss, and play around movies and TV shows. This document defines requirements for core experiences: **Habitats (group chats)**, **Streaming/Watch Parties**, **AI Discussion Mode**, **Movie & Friend Recommendations**, and **Group Games** (Binge Race and Role‑Based Chat). The identity layer (auth + profiles) underpins safety, personalization, and community features across the app.

## Requirements

### Requirement 1 — Signup

**User Story:** As a new user, I want to sign up with email and password so I can access MoovyZoo.

#### Acceptance Criteria

1. WHEN the user visits the signup page THEN the system SHALL display email and password fields.
2. WHEN the user enters a valid email and password THEN the system SHALL create an account.
3. WHEN the email format is invalid THEN the system SHALL display a clear error message.
4. WHEN the password is < 8 characters THEN the system SHALL display a password strength error.
5. WHEN signup succeeds THEN the system SHALL redirect to onboarding.

---

### Requirement 2 — Onboarding

**User Story:** As a new user, I want an onboarding flow so I can set preferences that personalize my MoovyZoo experience.

#### Acceptance Criteria

1. WHEN signup completes THEN the system SHALL start onboarding.
2. WHEN onboarding begins THEN the system SHALL collect: display name, avatar (optional), preferred genres, favorite titles/directors.
3. WHEN the user selects genres THEN the system SHALL suggest starter **Habitats** to join.
4. WHEN the user sets notification and privacy preferences THEN the system SHALL store them.
5. WHEN onboarding completes THEN the system SHALL redirect to the Home feed with suggested Habitats and titles.

---

### Requirement 3 — Login & Session

**User Story:** As a returning user, I want to log in and stay signed in so I can resume where I left off.

#### Acceptance Criteria

1. WHEN the user visits the login page THEN the system SHALL display email and password fields.
2. WHEN valid credentials are submitted THEN the system SHALL authenticate and redirect to Home.
3. WHEN invalid credentials are submitted THEN the system SHALL display an authentication error.
4. WHEN authenticated THEN the system SHALL persist the session across refreshes.
5. WHEN the user logs out THEN the system SHALL clear the session and redirect to Login.

---

### Requirement 4 — Profile Management

**User Story:** As a user, I want to edit my profile so others see my interests and I get relevant recommendations.

#### Acceptance Criteria

1. WHEN accessing the profile page THEN the system SHALL display current profile data.
2. WHEN updating display name, bio, or avatar THEN the system SHALL save and reflect changes app‑wide.
3. WHEN updating genres, favorite titles, or directors THEN the system SHALL save arrays of selections.
4. WHEN the profile is saved THEN the system SHALL confirm success and refresh recommendation inputs.
5. WHEN viewing another user’s profile THEN the system SHALL show public fields only (respecting privacy settings).

---

### Requirement 5 — Privacy & Safety

**User Story:** As a user, I want control over my visibility and interactions so I feel safe engaging with the community.

#### Acceptance Criteria

1. WHEN accessing privacy settings THEN the system SHALL display a profile visibility toggle (Public/Private).
2. WHEN set to Private THEN the system SHALL exclude the profile from public discovery and limit profile fields to a minimal set.
3. WHEN set to Public THEN the system SHALL make the profile discoverable in recommendations and searches.
4. WHEN blocking or reporting a user THEN the system SHALL hide their content for the reporter and queue a moderation review.
5. WHEN privacy settings change THEN the system SHALL apply them immediately across Habitats, Parties, and search.

---

### Requirement 6 — Security

**User Story:** As a user, I want secure authentication and protected data.

#### Acceptance Criteria

1. WHEN handling passwords THEN the system SHALL rely on a secure auth provider for hashing/salting (e.g., Firebase Auth); no plaintext storage.
2. WHEN repeated login failures occur (≥5) THEN the system SHALL rate‑limit authentication attempts.
3. WHEN a session expires THEN the system SHALL require re‑authentication for protected actions.
4. WHEN data is transmitted THEN the system SHALL use HTTPS.
5. WHEN a sensitive profile change occurs THEN the system SHALL require re‑authentication or multi‑step confirmation.

---

### Requirement 7 — Habitats (Group Chats)

**User Story:** As a user, I want themed group chats (“Habitats”) to discuss movies and shows with fans like me.

#### Acceptance Criteria

1. WHEN browsing Habitats THEN the system SHALL list genre/fandom spaces with member counts.
2. WHEN joining a Habitat THEN the system SHALL grant access to real‑time chat and reactions (emoji/GIF).
3. WHEN posting a message THEN the system SHALL deliver it to members in real time and persist it.
4. WHEN a message is flagged THEN the system SHALL record a moderation flag and limit visibility per policy.
5. WHEN a user leaves a Habitat THEN the system SHALL remove it from their Home and mute notifications.

---

### Requirement 8 — Streaming/Watch Parties

**User Story:** As a user, I want to host or join a watch party to experience a title together with chat.

#### Acceptance Criteria

1. WHEN creating a Party THEN the system SHALL capture title reference, start time, and invite link.
2. WHEN Party lobby opens THEN the system SHALL show a countdown and participant list.
3. WHEN Party starts THEN the system SHALL enable a synchronized “Start” state and Party chat.
4. WHEN a host ends the Party THEN the system SHALL mark the session ended and archive the chat.
5. WHEN no streaming integration is available (MVP) THEN the system SHALL support manual sync and timestamped chat.

---

### Requirement 9 — AI Discussion Mode

**User Story:** As a user, I want to ask movie questions and get concise insights (themes, symbolism, trivia).

#### Acceptance Criteria

1. WHEN the user opens AI Discussion THEN the system SHALL accept a title/scene description or question.
2. WHEN submitted THEN the system SHALL return a concise insight (120–180 words) with themes/symbolism and optional trivia.
3. WHEN response returns THEN the system SHALL display it inline in chat or a side panel and allow quick follow‑ups.
4. WHEN prompts include disallowed content THEN the system SHALL respond safely and refuse if necessary.
5. WHEN the same question is asked again THEN the system SHOULD serve a cached result where applicable.

---

### Requirement 10 — Recommendations (Movies & Friends)

**User Story:** As a user, I want suggestions for titles and people I’d enjoy discussing them with.

#### Acceptance Criteria

1. WHEN generating recommendations THEN the system SHALL use profile genres, favorites, and Habitat activity.
2. WHEN showing Movie recommendations THEN the system SHALL display title card, synopsis, and reason (e.g., “Because you like Sci‑Fi & Nolan”).
3. WHEN showing Friend recommendations (“Movie DNA”) THEN the system SHALL display compatibility score and shared interests.
4. WHEN a recommendation is dismissed THEN the system SHALL reduce similar suggestions for a period.
5. WHEN a recommendation is saved THEN the system SHALL add it to the user’s Watchlist or Friends to Follow.

---

### Requirement 11 — Group Games: Binge Race

**User Story:** As a user, I want to race friends to finish a series first.

#### Acceptance Criteria

1. WHEN creating a Race THEN the system SHALL capture the series, start point, and invited participants.
2. WHEN participants check off episodes THEN the system SHALL update a real‑time leaderboard (% complete, next episode).
3. WHEN milestones are hit (e.g., “Most Episodes Today”) THEN the system SHALL award badges or highlights.
4. WHEN someone completes the series THEN the system SHALL declare a winner and show a race recap.
5. WHEN a Race ends THEN the system SHALL archive stats on participants’ profiles.

---

### Requirement 12 — Group Games: Role‑Based Chat (In‑Character Mode)

**User Story:** As a user, I want to chat in character from a selected movie/show for a playful session.

#### Acceptance Criteria

1. WHEN starting In‑Character Mode THEN the system SHALL assign characters or allow host assignment.
2. WHEN the session begins THEN the system SHALL display messages under character names/avatars (not real profiles) for the session.
3. WHEN a participant requests help THEN the system SHALL provide a brief character guide (style, catchphrases, quirks).
4. WHEN AI prompts are enabled THEN the system SHALL inject periodic plot twists or scene prompts.
5. WHEN the session ends THEN the system SHALL save a recap transcript for participants.

---

### Requirement 13 — Cross‑Feature Integration

**User Story:** As a user, I want my profile and actions to connect features smoothly.

#### Acceptance Criteria

1. WHEN profile genres/favorites change THEN the system SHALL refresh inputs for recommendations and Habitat suggestions.
2. WHEN chatting in Habitats or Parties THEN the system SHALL use current display name/avatar and respect privacy settings.
3. WHEN badges are earned (e.g., Binge Race winner) THEN the system SHALL display them on the profile.
4. WHEN AI insights are generated for a title THEN the system SHALL make them discoverable in the related Habitat or Scene thread (if public).
5. WHEN a user is blocked THEN the system SHALL hide their content across Habitats, Parties, and recommendations.

---

### Requirement 14 — Error Handling & Messaging

**User Story:** As a user, I want clear, friendly error messages so I know what to do next.

#### Acceptance Criteria

1. WHEN an error occurs THEN the system SHALL normalize it to a single `AppErrorCode`.
2. WHEN showing an error THEN the system SHALL display a ≤140‑character friendly message (no raw stack traces).
3. WHEN offline THEN the system SHALL show an offline message and retry guidance.
4. WHEN rate limits are hit THEN the system SHALL show a “Slow down” message and recover gracefully.
5. WHEN validation fails THEN the system SHALL highlight fields and provide concise, actionable hints.
