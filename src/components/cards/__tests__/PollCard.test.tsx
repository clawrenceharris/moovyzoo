import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PollCard } from "../PollCard";

const mockPoll = {
  id: "poll-1",
  title: "What's your favorite sci-fi movie?",
  description: "Vote for your all-time favorite science fiction movie",
  options: [
    { id: "opt-1", text: "Blade Runner", vote_count: 15 },
    { id: "opt-2", text: "The Matrix", vote_count: 23 },
    { id: "opt-3", text: "Interstellar", vote_count: 18 },
  ],
  total_votes: 56,
  user_vote: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  habitat_id: "habitat-1",
  creator_id: "user-1",
  created_by: {
    id: "user-1",
    username: "poll_creator",
    avatar_url: null,
  },
  is_active: true,
};

const mockPollWithUserVote = {
  ...mockPoll,
  user_vote: {
    id: "vote-1",
    option_id: "opt-2",
    user_id: "current-user",
    created_at: "2024-01-02T00:00:00Z",
  },
};

describe("PollCard", () => {
  it("renders poll information correctly", () => {
    const mockOnClick = vi.fn();
    render(<PollCard poll={mockPoll} onClick={mockOnClick} />);

    expect(
      screen.getByText("What's your favorite sci-fi movie?")
    ).toBeInTheDocument();
    expect(screen.getByText("56 votes")).toBeInTheDocument();
    expect(screen.getByText("Vote now →")).toBeInTheDocument();
  });

  it("displays vote count with chart icon", () => {
    const mockOnClick = vi.fn();
    render(<PollCard poll={mockPoll} onClick={mockOnClick} />);

    const voteCount = screen.getByText("56");
    expect(voteCount).toBeInTheDocument();

    // Check that the chart icon is rendered
    const card = screen.getByTestId("poll-card");
    const chartIcon = card.querySelector("svg");
    expect(chartIcon).toBeInTheDocument();
  });

  it("calls onClick when card is clicked", () => {
    const mockOnClick = vi.fn();
    render(<PollCard poll={mockPoll} onClick={mockOnClick} />);

    const card = screen.getByTestId("poll-card");
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("shows 'Vote now →' when user hasn't voted", () => {
    const mockOnClick = vi.fn();
    render(<PollCard poll={mockPoll} onClick={mockOnClick} />);

    expect(screen.getByText("Vote now →")).toBeInTheDocument();
    expect(screen.queryByText("View results →")).not.toBeInTheDocument();
    expect(screen.queryByText("• You voted")).not.toBeInTheDocument();
  });

  it("shows 'View results →' and '• You voted' when user has voted", () => {
    const mockOnClick = vi.fn();
    render(<PollCard poll={mockPollWithUserVote} onClick={mockOnClick} />);

    expect(screen.getByText("View results →")).toBeInTheDocument();
    expect(screen.getByText(/• You voted/)).toBeInTheDocument();
    expect(screen.queryByText("Vote now →")).not.toBeInTheDocument();
  });

  it("displays singular 'vote' for one vote", () => {
    const pollWithOneVote = { ...mockPoll, total_votes: 1 };
    const mockOnClick = vi.fn();
    render(<PollCard poll={pollWithOneVote} onClick={mockOnClick} />);

    expect(screen.getByText("1 vote")).toBeInTheDocument();
    expect(screen.queryByText("1 votes")).not.toBeInTheDocument();
  });

  it("displays plural 'votes' for multiple votes", () => {
    const mockOnClick = vi.fn();
    render(<PollCard poll={mockPoll} onClick={mockOnClick} />);

    expect(screen.getByText("56 votes")).toBeInTheDocument();
  });

  it("displays zero votes correctly", () => {
    const pollWithZeroVotes = { ...mockPoll, total_votes: 0 };
    const mockOnClick = vi.fn();
    render(<PollCard poll={pollWithZeroVotes} onClick={mockOnClick} />);

    expect(screen.getByText("0 votes")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const mockOnClick = vi.fn();
    render(
      <PollCard
        poll={mockPoll}
        onClick={mockOnClick}
        className="custom-poll-class"
      />
    );

    const card = screen.getByTestId("poll-card");
    expect(card).toHaveClass("custom-poll-class");
  });

  it("has proper hover and transition classes", () => {
    const mockOnClick = vi.fn();
    render(<PollCard poll={mockPoll} onClick={mockOnClick} />);

    const card = screen.getByTestId("poll-card");
    expect(card).toHaveClass(
      "hover:bg-muted/50",
      "cursor-pointer",
      "transition-colors",
      "group"
    );
  });

  it("handles multiple clicks correctly", () => {
    const mockOnClick = vi.fn();
    render(<PollCard poll={mockPoll} onClick={mockOnClick} />);

    const card = screen.getByTestId("poll-card");

    fireEvent.click(card);
    fireEvent.click(card);
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledTimes(3);
  });

  it("renders with all required CSS classes", () => {
    const mockOnClick = vi.fn();
    render(<PollCard poll={mockPoll} onClick={mockOnClick} />);

    const card = screen.getByTestId("poll-card");
    expect(card).toHaveClass("p-4", "border", "border-border", "rounded-lg");
  });

  it("renders title with proper styling and hover effect", () => {
    const mockOnClick = vi.fn();
    render(<PollCard poll={mockPoll} onClick={mockOnClick} />);

    const title = screen.getByText("What's your favorite sci-fi movie?");
    expect(title.tagName).toBe("H4");
    expect(title).toHaveClass(
      "font-medium",
      "text-foreground",
      "group-hover:text-primary",
      "transition-colors"
    );
  });

  it("renders vote count in header with proper styling", () => {
    const mockOnClick = vi.fn();
    render(<PollCard poll={mockPoll} onClick={mockOnClick} />);

    // Find the vote count in the header (not in the footer)
    const card = screen.getByTestId("poll-card");
    const headerVoteCount = card.querySelector(
      ".flex.items-start.justify-between .text-xs.text-muted-foreground"
    );
    expect(headerVoteCount).toHaveTextContent("56");
  });

  it("renders footer with proper vote information", () => {
    const mockOnClick = vi.fn();
    render(<PollCard poll={mockPoll} onClick={mockOnClick} />);

    const footer = screen.getByText("56 votes").parentElement;
    expect(footer).toHaveClass(
      "flex",
      "items-center",
      "justify-between",
      "text-xs",
      "text-muted-foreground"
    );
  });

  it("renders action text with accent color", () => {
    const mockOnClick = vi.fn();
    render(<PollCard poll={mockPoll} onClick={mockOnClick} />);

    const actionText = screen.getByText("Vote now →");
    expect(actionText).toHaveClass("text-accent");
  });

  it("handles poll with user vote correctly", () => {
    const mockOnClick = vi.fn();
    render(<PollCard poll={mockPollWithUserVote} onClick={mockOnClick} />);

    // Should show both vote count and user voted indicator
    expect(screen.getByText("56 votes • You voted")).toBeInTheDocument();
    expect(screen.getByText("View results →")).toBeInTheDocument();
  });

  it("renders chart icon with proper attributes", () => {
    const mockOnClick = vi.fn();
    render(<PollCard poll={mockPoll} onClick={mockOnClick} />);

    const card = screen.getByTestId("poll-card");
    const icon = card.querySelector("svg");
    expect(icon).toHaveClass("w-3", "h-3");
    expect(icon).toHaveAttribute("fill", "none");
    expect(icon).toHaveAttribute("stroke", "currentColor");
    expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
  });
});
