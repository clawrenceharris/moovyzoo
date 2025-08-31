// TMDB utilities barrel export
export * from "./service";
export { moviedb } from "../tmbd/client";

// Re-export commonly used types for convenience
export type {
  TMDBSearchResult,
  SelectedMedia,
  TMDBMultiSearchResponse,
} from "./service";
