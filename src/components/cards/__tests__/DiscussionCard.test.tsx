import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DiscussionCard } from "../DiscussionCard";

const mockDiscussion = {
  id: "discussion-1",
  name: "Favorite Sci-Fi Movies",
  description:
    "Let's discuss our favorite science fiction movies and what makes them special",
  message_count: 42,
  last_message_at: "2024-01-15T10:30:00Z",
  created_at: "2024-01-01T00:00:00Z",
  habitat_id: "habitat-1",
  creator_id: "user-1",
  created_by: {
    id: "user-1",
    username: "scifi_fan",
    avatar_url: null,
  },
  is_active: true,
};

describe("DiscussionCard", () => {
  it("renders discussion information correctly", () => {
    const mockOnClick = vi.fn();
    render(
      <DiscussionCard discussion={mockDiscussion} onClick={mockOnClick} />
    );

    expect(screen.getByText("Favorite Sci-Fi Movies")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Let's discuss our favorite science fiction movies and what makes them special"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("displays message count with users icon", () => {
    const mockOnClick = vi.fn();
    render(
      <DiscussionCard discussion={mockDiscussion} onClick={mockOnClick} />
    );

    const messageCount = screen.getByText("42");
    expect(messageCount).toBeInTheDocument();

    // Check that the Users icon is rendered (lucide-react Users component)
    const card = screen.getByTestId("discussion-card");
    const usersIcon = card.querySelector("svg");
    expect(usersIcon).toBeInTheDocument();
  });

  it("calls onClick when card is clicked", () => {
    const mockOnClick = vi.fn();
    render(
      <DiscussionCard discussion={mockDiscussion} onClick={mockOnClick} />
    );

    const card = screen.getByTestId("discussion-card");
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("renders without description when showDescription is false", () => {
    const mockOnClick = vi.fn();
    render(
      <DiscussionCard
        discussion={mockDiscussion}
        onClick={mockOnClick}
        showDescription={false}
      />
    );

    expect(screen.getByText("Favorite Sci-Fi Movies")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Let's discuss our favorite science fiction movies and what makes them special"
      )
    ).not.toBeInTheDocument();
  });

  it("renders without description when description is null", () => {
    const discussionWithoutDescription = {
      ...mockDiscussion,
      description: null,
    };
    const mockOnClick = vi.fn();
    render(
      <DiscussionCard
        discussion={discussionWithoutDescription}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText("Favorite Sci-Fi Movies")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Let's discuss our favorite science fiction movies and what makes them special"
      )
    ).not.toBeInTheDocument();
  });

  it("renders without description when description is empty string", () => {
    const discussionWithEmptyDescription = {
      ...mockDiscussion,
      description: "",
    };
    const mockOnClick = vi.fn();
    render(
      <DiscussionCard
        discussion={discussionWithEmptyDescription}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText("Favorite Sci-Fi Movies")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Let's discuss our favorite science fiction movies and what makes them special"
      )
    ).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const mockOnClick = vi.fn();
    render(
      <DiscussionCard
        discussion={mockDiscussion}
        onClick={mockOnClick}
        className="custom-discussion-class"
      />
    );

    const card = screen.getByTestId("discussion-card");
    expect(card).toHaveClass("custom-discussion-class");
  });

  it("displays zero message count correctly", () => {
    const discussionWithNoMessages = { ...mockDiscussion, message_count: 0 };
    const mockOnClick = vi.fn();
    render(
      <DiscussionCard
        discussion={discussionWithNoMessages}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("displays large message count correctly", () => {
    const discussionWithManyMessages = {
      ...mockDiscussion,
      message_count: 1234,
    };
    const mockOnClick = vi.fn();
    render(
      <DiscussionCard
        discussion={discussionWithManyMessages}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText("1234")).toBeInTheDocument();
  });

  it("handles discussion without last_message_at", () => {
    const discussionWithoutLastMessage = {
      ...mockDiscussion,
      last_message_at: null,
    };
    const mockOnClick = vi.fn();
    render(
      <DiscussionCard
        discussion={discussionWithoutLastMessage}
        onClick={mockOnClick}
      />
    );

    // Should still render the card properly
    expect(screen.getByText("Favorite Sci-Fi Movies")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("has proper hover and transition classes", () => {
    const mockOnClick = vi.fn();
    render(
      <DiscussionCard discussion={mockDiscussion} onClick={mockOnClick} />
    );

    const card = screen.getByTestId("discussion-card");
    expect(card).toHaveClass(
      "hover:bg-card/80",
      "hover:border-accent/30",
      "cursor-pointer",
      "transition-all",
      "duration-200",
      "group"
    );
  });

  it("handles multiple clicks correctly", () => {
    const mockOnClick = vi.fn();
    render(
      <DiscussionCard discussion={mockDiscussion} onClick={mockOnClick} />
    );

    const card = screen.getByTestId("discussion-card");

    fireEvent.click(card);
    fireEvent.click(card);
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledTimes(3);
  });

  it("renders with all required CSS classes", () => {
    const mockOnClick = vi.fn();
    render(
      <DiscussionCard discussion={mockDiscussion} onClick={mockOnClick} />
    );

    const card = screen.getByTestId("discussion-card");
    expect(card).toHaveClass(
      "p-4",
      "bg-card",
      "rounded-lg",
      "backdrop-blur-sm"
    );
  });

  it("renders title with proper styling", () => {
    const mockOnClick = vi.fn();
    render(
      <DiscussionCard discussion={mockDiscussion} onClick={mockOnClick} />
    );

    const title = screen.getByText("Favorite Sci-Fi Movies");
    expect(title.tagName).toBe("H4");
    expect(title).toHaveClass(
      "font-semibold",
      "text-foreground",
      "transition-colors",
      "mb-2"
    );
  });

  it("renders description with proper styling when shown", () => {
    const mockOnClick = vi.fn();
    render(
      <DiscussionCard discussion={mockDiscussion} onClick={mockOnClick} />
    );

    const description = screen.getByText(
      "Let's discuss our favorite science fiction movies and what makes them special"
    );
    expect(description.tagName).toBe("P");
    expect(description).toHaveClass(
      "text-sm",
      "text-muted-foreground",
      "mb-3",
      "line-clamp-2"
    );
  });

  it("renders message count container with proper styling", () => {
    const mockOnClick = vi.fn();
    render(
      <DiscussionCard discussion={mockDiscussion} onClick={mockOnClick} />
    );

    // Find the container by looking for the div that contains both the Users icon and message count
    const container = screen
      .getByText("42")
      .closest(".flex.items-center.gap-1");
    expect(container).toHaveClass(
      "flex",
      "items-center",
      "gap-1",
      "text-xs",
      "text-muted-foreground"
    );
  });
});
