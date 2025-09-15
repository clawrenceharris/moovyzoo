import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RecommendationsSection } from "../RecommendationsSection";
import type { ContentRecommendation, FriendSuggestion } from "@/features/ai-recommendations/types/recommendations";

const mockContentRecommendations: ContentRecommendation[] = [
  {
    tmdb_id: 12345,
    title: "Inception",
    media_type: "movie",
    poster_url: "https://image.tmdb.org/t/p/w500/poster1.jpg",
    match_score: 85,
    short_explanation: "Matches your love for sci-fi thrillers",
  },
  {
    tmdb_id: 67890,
    title: "Breaking Bad",
    media_type: "tv",
    poster_url: "https://image.tmdb.org/t/p/w500/poster2.jpg",
    match_score: 92,
    short_explanation: "Perfect for drama fans",
  },
];

const mockFriendSuggestions: FriendSuggestion[] = [
  {
    user_id: "user-123",
    display_name: "John Doe",
    avatar_url: "https://example.com/avatar1.jpg",
    taste_match_score: 92,
    short_rationale: "Also gave Parasite & Whiplash 9/10",
  },
  {
    user_id: "user-456",
    display_name: "Jane Smith",
    avatar_url: "https://example.com/avatar2.jpg",
    taste_match_score: 88,
    short_rationale: "Loves the same thriller movies",
  },
];

describe("RecommendationsSection", () => {
  it("should render content recommendations and friend suggestions", () => {
    const props = {
      contentRecommendations: mockContentRecommendations,
      friendSuggestions: mockFriendSuggestions,
      isLoading: false,
      onRefreshRecommendations: vi.fn(),
      onContentClick: vi.fn(),
      onFriendClick: vi.fn(),
    };
    
    render(<RecommendationsSection {...props} />);

    expect(screen.getByText("Recommended for You")).toBeInTheDocument();
    expect(screen.getByText("People You Might Like")).toBeInTheDocument();
    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByText("Breaking Bad")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("should show loading state when isLoading is true", () => {
    const props = {
      contentRecommendations: [],
      friendSuggestions: [],
      isLoading: true,
      onRefreshRecommendations: vi.fn(),
      onContentClick: vi.fn(),
      onFriendClick: vi.fn(),
    };
    
    render(<RecommendationsSection {...props} />);

    expect(screen.getAllByTestId("loading-state")).toHaveLength(2);
  });

  it("should show error state when error is provided", () => {
    const props = {
      contentRecommendations: [],
      friendSuggestions: [],
      isLoading: false,
      error: "Failed to load recommendations",
      onRefreshRecommendations: vi.fn(),
      onContentClick: vi.fn(),
      onFriendClick: vi.fn(),
    };
    
    render(<RecommendationsSection {...props} />);

    expect(screen.getByText("Unable to load recommendations")).toBeInTheDocument();
    expect(screen.getByText("Failed to load recommendations")).toBeInTheDocument();
  });

  it("should show empty state when no recommendations are available", () => {
    const props = {
      contentRecommendations: [],
      friendSuggestions: [],
      isLoading: false,
      onRefreshRecommendations: vi.fn(),
      onContentClick: vi.fn(),
      onFriendClick: vi.fn(),
    };
    
    render(<RecommendationsSection {...props} />);

    expect(screen.getByText("No recommendations yet")).toBeInTheDocument();
    expect(screen.getByText("We're learning your preferences. Check back soon for personalized suggestions!")).toBeInTheDocument();
  });

  it("should call onRefreshRecommendations when refresh button is clicked", () => {
    const onRefreshRecommendations = vi.fn();
    const props = {
      contentRecommendations: mockContentRecommendations,
      friendSuggestions: mockFriendSuggestions,
      isLoading: false,
      onRefreshRecommendations,
      onContentClick: vi.fn(),
      onFriendClick: vi.fn(),
    };
    
    render(<RecommendationsSection {...props} />);

    fireEvent.click(screen.getByText("New Recommendations"));
    expect(onRefreshRecommendations).toHaveBeenCalled();
  });

  it("should call onContentClick when content card is clicked", () => {
    const onContentClick = vi.fn();
    const props = {
      contentRecommendations: mockContentRecommendations,
      friendSuggestions: [],
      isLoading: false,
      onRefreshRecommendations: vi.fn(),
      onContentClick,
      onFriendClick: vi.fn(),
    };
    
    render(<RecommendationsSection {...props} />);

    fireEvent.click(screen.getByText("Inception").closest('[data-testid="media-card"]')!);
    expect(onContentClick).toHaveBeenCalledWith(12345, "movie");
  });

  it("should call onFriendClick when friend card profile area is clicked", () => {
    const onFriendClick = vi.fn();
    const props = {
      contentRecommendations: [],
      friendSuggestions: mockFriendSuggestions,
      isLoading: false,
      onRefreshRecommendations: vi.fn(),
      onContentClick: vi.fn(),
      onFriendClick,
    };
    
    render(<RecommendationsSection {...props} />);

    fireEvent.click(screen.getByText("John Doe").closest('[data-testid="friend-profile-area"]')!);
    expect(onFriendClick).toHaveBeenCalledWith("user-123");
  });
});