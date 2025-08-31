# Implementation Plan

- [x] 1. Add basic TV show types to TMDB repository
  - Add TMDBTVShow and TMDBTVShowDetails interfaces to tmdb.repository.ts
  - Add basic season and episode interfaces for API responses
  - Only complete the steps in the current task.
  - Write clean code without introducing extra complexity
  - _Requirements: 1.1, 2.1, 3.1_

- [X] 2. Implement the 5 TV show repository functions
- [x] 2.1 Add searchTVShow function
  - Implement searchTVShow function using /search/tv endpoint
  - Add optional year parameter
  - Only complete the steps in the current task.
  - Write clean code without introducing extra complexity
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2.2 Add getTVShowDetails function
  - Implement getTVShowDetails using /tv/{tv_id} with append_to_response
  - Include credits, videos, content_ratings, external_ids
  - Only complete the steps in the current task.
  - Write clean code without introducing extra complexity
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.3 Add getSeasonOrEpisode function
  - Implement single function handling both /tv/{tv_id}/season/{season_number} and episode endpoints
  - Use optional episode_number parameter to determine which endpoint to call
  - Look up existing codebase and results of previous tasks to ensure the functionality doesn't already exist. Skip a step if it is already implemented.
  - Only complete the steps in the current task.
  - Write clean code without introducing extra complexity
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 2.4 Add getSimilarOrRecommendationsTV function
  - Implement function supporting both /tv/{tv_id}/similar and /tv/{tv_id}/recommendations
  - Use type parameter to switch between endpoints
  - Look up existing codebase and results of previous tasks to ensure the functionality doesn't already exist. Skip a step if it is already implemented.
  - Only complete the steps in the current task.
  - Write clean code without introducing extra complexity
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 2.5 Add getTrendingOrAiringTV function
  - Implement function supporting trending, on_the_air, airing_today, popular, top_rated endpoints
  - Use kind parameter to determine which endpoint to call
  - Look up existing codebase and results of previous tasks to ensure the functionality doesn't already exist. Skip a step if it is already implemented.
  - Only complete the steps in the current task.
  - Write clean code without introducing extra complexity
  - Refer to `.kiro/specs/tv-show-integration/design.md` for understanding the logic behind this task
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 3. Create the 5 LangChain TV show tools
- [x] 3.1 Create search_tv tool
  - Wrap searchTVShow function with LangChain tool interface
  - Define Zod schema for title and optional year
  - Look up existing codebase and results of previous tasks to ensure the functionality doesn't already exist. Skip a step if it is already implemented.
  - Refer to `.kiro/specs/tv-show-integration/design.md` for understanding the logic behind this task
  - Only complete the steps in the current task.
  - Write clean code without introducing extra complexity
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3.2 Create get_tv_details tool
  - Wrap getTVShowDetails function with LangChain tool interface
  - Define Zod schema for tv_id parameter
  - Look up existing codebase and results of previous tasks to ensure the functionality doesn't already exist. Skip a step if it is already implemented.
  - Refer to `.kiro/specs/tv-show-integration/design.md` for understanding the logic behind this task
  - Only complete the steps in the current task.
  - Write clean code without introducing extra complexity
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3.3 Create get_season_or_episode tool
  - Wrap getSeasonOrEpisode function with LangChain tool interface
  - Define Zod schema with tv_id, optional season_number, optional episode_number
  - Look up existing codebase and results of previous tasks to ensure the functionality doesn't already exist. Skip a step if it is already implemented.
  - Refer to `.kiro/specs/tv-show-integration/design.md` for understanding the logic behind this task
  - Only complete the steps in the current task.
  - Write clean code without introducing extra complexity
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3.4 Create get_similar_or_recommendations_tv tool
  - Wrap getSimilarOrRecommendationsTV function with LangChain tool interface
  - Define Zod schema with tv_id and type enum
  - Look up existing codebase and results of previous tasks to ensure the functionality doesn't already exist. Skip a step if it is already implemented.
  - Refer to `.kiro/specs/tv-show-integration/design.md` for understanding the logic behind this task
  - Only complete the steps in the current task.
  - Write clean code without introducing extra complexity
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 3.5 Create get_trending_or_airing_tv tool
  - Wrap getTrendingOrAiringTV function with LangChain tool interface
  - Define Zod schema with kind enum and optional region
  - Look up existing codebase and results of previous tasks to ensure the functionality doesn't already exist. Skip a step if it is already implemented.
  - Only complete the steps in the current task.
  - Write clean code without introducing extra complexity
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4. Update agent configuration
  - Add all 5 TV show tools to tmdbTools array in tmdb-tools.ts
  - Update agent message modifier in langraph-config.ts to mention TV show capabilities
  - Look up existing codebase and results of previous tasks to ensure the functionality doesn't already exist. Skip a step if it is already implemented.
  - Refer to `.kiro/specs/tv-show-integration/design.md` for understanding the logic behind this task
  - Only complete the steps in the current task.
  - Write clean code without introducing extra complexity
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 5. Add TV show starter prompts
  - Add 2-3 TV show starter prompts to StarterPrompts.tsx
  - Include concrete examples like "What is **Breaking Bad** about?" and "Recommend shows similar to **The Office**"
  - Look up existing codebase and results of previous tasks to ensure the functionality doesn't already exist. Skip a step if it is already implemented.
  - Refer to `.kiro/specs/tv-show-integration/design.md` for understanding the logic behind this task
  - Only complete the steps in the current task.
  - Write clean code without introducing extra complexity
  - _Requirements: 6.1, 6.2, 6.3, 6.4_