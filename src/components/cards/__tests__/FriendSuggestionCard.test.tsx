import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FriendSuggestionCard } from "../FriendSuggestionCard";
import type { FriendSuggestion } from "@/features/ai-recommendations/types/recommendations";

const mockSuggestion: FriendSuggestion = {
  user_id: "user-123",
  display_name: "John Doe",
  avatar_url: "https://example.com/avatar.jpg",
  taste_match_score: 92,
  short_rationale: "Also gave Parasite & Whiplash 9/10",
  shared_titles: ["Parasite", "Whiplash"],
  shared_genres: ["Drama", "Thriller"],
  mutual_friends_count: 3,
};

describe("FriendSuggestionCard", () => {
  it("should render with friend suggestion data", () => {
    const onProfileClick = vi.fn();
    const onSendFriendRequest = vi.fn();
    
    render(
      <FriendSuggestionCard
        suggestion={mockSuggestion}
        onProfileClick={onProfileClick}
        onSendFriendRequest={onSendFriendRequest}
        currentUserId="current-user"
      />
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("92% Match")).toBeInTheDocument();
    expect(screen.getByText("Also gave Parasite & Whiplash 9/10")).toBeInTheDocument();
  });

  it("should call onProfileClick when profile area is clicked", () => {
    const onProfileClick = vi.fn();
    const onSendFriendRequest = vi.fn();
    
    render(
      <FriendSuggestionCard
        suggestion={mockSuggestion}
        onProfileClick={onProfileClick}
        onSendFriendRequest={onSendFriendRequest}
        currentUserId="current-user"
      />
    );

    fireEvent.click(screen.getByTestId("friend-profile-area"));
    expect(onProfileClick).toHaveBeenCalledWith("user-123");
  });

  it("should call onSendFriendRequest when add friend button is clicked", () => {
    const onProfileClick = vi.fn();
    const onSendFriendRequest = vi.fn();
    
    render(
      <FriendSuggestionCard
        suggestion={mockSuggestion}
        onProfileClick={onProfileClick}
        onSendFriendRequest={onSendFriendRequest}
        currentUserId="current-user"
      />
    );

    fireEvent.click(screen.getByText("Add Friend"));
    expect(onSendFriendRequest).toHaveBeenCalledWith("user-123");
  });

  it("should render fallback avatar when no avatar_url", () => {
    const suggestionWithoutAvatar = {
      ...mockSuggestion,
      avatar_url: undefined,
    };
    const onProfileClick = vi.fn();
    const onSendFriendRequest = vi.fn();
    
    render(
      <FriendSuggestionCard
        suggestion={suggestionWithoutAvatar}
        onProfileClick={onProfileClick}
        onSendFriendRequest={onSendFriendRequest}
        currentUserId="current-user"
      />
    );

    expect(screen.getByTestId("friend-avatar-fallback")).toBeInTheDocument();
  });

  it("should prevent profile click when button is clicked", () => {
    const onProfileClick = vi.fn();
    const onSendFriendRequest = vi.fn();
    
    render(
      <FriendSuggestionCard
        suggestion={mockSuggestion}
        onProfileClick={onProfileClick}
        onSendFriendRequest={onSendFriendRequest}
        currentUserId="current-user"
      />
    );

    fireEvent.click(screen.getByTestId("friend-action-button"));
    expect(onProfileClick).not.toHaveBeenCalled();
    expect(onSendFriendRequest).toHaveBeenCalledWith("user-123");
  });
});