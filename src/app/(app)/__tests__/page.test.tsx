import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRouter } from "next/navigation";
import Home from "../page";

// Mock the hooks and components
vi.mock("@/hooks/use-user", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/features/profile/hooks/useProfile", () => ({
  useProfile: vi.fn(),
}));

vi.mock("@/features/ai-recommendations/hooks/use-recommendations", () => ({
  useRecommendations: vi.fn(),
}));

vi.mock("@/features/profile/hooks/use-friend-actions", () => ({
  useFriendActions: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/features/profile/components/MockWatchHistoryDemo", () => ({
  MockWatchHistoryDemo: () => <div data-testid="mock-watch-history">Mock Watch History</div>,
}));

vi.mock("@/components/cards/RecommendationsSection", () => ({
  RecommendationsSection: ({ 
    contentRecommendations, 
    friendSuggestions, 
    isLoading, 
    error,
    onRefreshRecommendations,
    onContentClick,
    onFriendClick,
    onSendFriendRequest 
  }: any) => (
    <div data-testid="recommendations-section">
      <div data-testid="content-count">{contentRecommendations.length}</div>
      <div data-testid="friend-count">{friendSuggestions.length}</div>
      <div data-testid="loading-state">{isLoading.toString()}</div>
      <div data-testid="error-state">{error || "no-error"}</div>
      <button data-testid="refresh-button" onClick={onRefreshRecommendations}>
        Refresh
      </button>
      <button data-testid="content-click" onClick={() => onContentClick(123, 'movie')}>
        Content Click
      </button>
      <button data-testid="friend-click" onClick={() => onFriendClick('user-123')}>
        Friend Click
      </button>
      <button data-testid="send-friend-request" onClick={() => onSendFriendRequest('user-123')}>
        Send Friend Request
      </button>
    </div>
  ),
}));

const mockUseUser = vi.mocked(await import("@/hooks/use-user")).useUser;
const mockUseProfile = vi.mocked(await import("@/features/profile/hooks/useProfile")).useProfile;
const mockUseRecommendations = vi.mocked(await import("@/features/ai-recommendations/hooks/use-recommendations")).useRecommendations;
const mockUseFriendActions = vi.mocked(await import("@/features/profile/hooks/use-friend-actions")).useFriendActions;
const mockUseRouter = vi.mocked(useRouter);

describe("Home Page", () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter as any);
    
    // Default mock implementations
    mockUseUser.mockReturnValue({
      user: { id: "user-123", email: "test@example.com" } as any,
    });

    mockUseProfile.mockReturnValue({
      profile: { displayName: "Test User", id: "user-123" } as any,
      isLoading: false,
      error: null,
      updateProfile: vi.fn(),
      refetch: vi.fn(),
    });

    mockUseRecommendations.mockReturnValue({
      recommendations: {
        content_recommendations: [
          {
            tmdb_id: 123,
            title: "Test Movie",
            media_type: "movie" as const,
            match_score: 85,
            short_explanation: "Great match!",
          },
        ],
        friend_suggestions: [
          {
            user_id: "friend-123",
            display_name: "Friend User",
            taste_match_score: 90,
            short_rationale: "Similar taste",
          },
        ],
        cached: false,
        generated_at: new Date().toISOString(),
      },
      isLoading: false,
      error: null,
      refreshRecommendations: vi.fn(),
    });

    mockUseFriendActions.mockReturnValue({
      friendStatus: { status: "none" as const },
      isLoading: false,
      error: null,
      sendFriendRequest: vi.fn(),
      removeFriend: vi.fn(),
      acceptPendingRequest: vi.fn(),
      getButtonText: vi.fn(() => "Add Friend"),
      getButtonVariant: vi.fn(() => "primary" as const),
      isButtonDisabled: vi.fn(() => false),
      handleButtonClick: vi.fn(),
    });
  });

  it("should render welcome message with user name", () => {
    render(<Home />);
    
    expect(screen.getByText("Welcome,")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("What would you like to watch or explore today?")).toBeInTheDocument();
  });

  it("should render recommendations section with data", () => {
    render(<Home />);
    
    expect(screen.getByTestId("recommendations-section")).toBeInTheDocument();
    expect(screen.getByTestId("content-count")).toHaveTextContent("1");
    expect(screen.getByTestId("friend-count")).toHaveTextContent("1");
    expect(screen.getByTestId("loading-state")).toHaveTextContent("false");
    expect(screen.getByTestId("error-state")).toHaveTextContent("no-error");
  });

  it("should handle content click navigation", async () => {
    render(<Home />);
    
    const contentButton = screen.getByTestId("content-click");
    fireEvent.click(contentButton);
    
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/content/movie/123");
    });
  });

  it("should handle friend profile navigation", async () => {
    render(<Home />);
    
    const friendButton = screen.getByTestId("friend-click");
    fireEvent.click(friendButton);
    
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/profile/user-123");
    });
  });

  it("should handle friend request sending", async () => {
    // Mock fetch for the friend request
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true }),
    });
    global.fetch = mockFetch;

    render(<Home />);
    
    const sendRequestButton = screen.getByTestId("send-friend-request");
    fireEvent.click(sendRequestButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiverId: 'user-123' }),
      });
    });
  });

  it("should handle recommendations refresh", async () => {
    const mockRefresh = vi.fn();
    mockUseRecommendations.mockReturnValue({
      recommendations: null,
      isLoading: false,
      error: null,
      refreshRecommendations: mockRefresh,
    });

    render(<Home />);
    
    const refreshButton = screen.getByTestId("refresh-button");
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("should show loading state when recommendations are loading", () => {
    mockUseRecommendations.mockReturnValue({
      recommendations: null,
      isLoading: true,
      error: null,
      refreshRecommendations: vi.fn(),
    });

    render(<Home />);
    
    expect(screen.getByTestId("loading-state")).toHaveTextContent("true");
  });

  it("should show error state when recommendations fail", () => {
    mockUseRecommendations.mockReturnValue({
      recommendations: null,
      isLoading: false,
      error: "Failed to load recommendations",
      refreshRecommendations: vi.fn(),
    });

    render(<Home />);
    
    expect(screen.getByTestId("error-state")).toHaveTextContent("Failed to load recommendations");
  });

  it("should render mock watch history demo", () => {
    render(<Home />);
    
    expect(screen.getByTestId("mock-watch-history")).toBeInTheDocument();
  });

  it("should handle user without profile gracefully", () => {
    mockUseProfile.mockReturnValue({
      profile: null,
      isLoading: false,
      error: null,
      updateProfile: vi.fn(),
      refetch: vi.fn(),
    });

    render(<Home />);
    
    expect(screen.getByText("User")).toBeInTheDocument();
  });
});