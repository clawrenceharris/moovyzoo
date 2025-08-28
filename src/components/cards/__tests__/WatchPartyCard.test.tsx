import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WatchPartyCard } from "../WatchPartyCard";

// Mock Date to have consistent test results
const mockDate = new Date("2024-01-15T15:00:00Z");

const mockWatchParty = {
  id: "party-1",
  title: "Blade Runner 2049 Watch Party",
  description: "Join us for a viewing of Denis Villeneuve's masterpiece sequel",
  scheduled_time: "2024-01-15T20:00:00Z", // 5 hours after mock current time
  participant_count: 12,
  is_participant: false,
  habitat_id: "habitat-1",
  creator_id: "user-1",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  participants: [],
  created_by: {
    id: "user-1",
    username: "movie_host",
    avatar_url: null,
  },
  is_active: true,
};

const mockLiveWatchParty = {
  ...mockWatchParty,
  scheduled_time: "2024-01-15T15:15:00Z", // 15 minutes after mock current time (within 30 min window)
};

const mockEndedWatchParty = {
  ...mockWatchParty,
  scheduled_time: "2024-01-15T10:00:00Z", // 5 hours before mock current time
};

const mockJoinedWatchParty = {
  ...mockWatchParty,
  is_participant: true,
};

describe("WatchPartyCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders watch party information correctly", () => {
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard watchParty={mockWatchParty} onClick={mockOnClick} />
    );

    expect(
      screen.getByText("Blade Runner 2049 Watch Party")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Join us for a viewing of Denis Villeneuve's masterpiece sequel"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("12 joined")).toBeInTheDocument();
  });

  it("displays upcoming status for future watch parties", () => {
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard watchParty={mockWatchParty} onClick={mockOnClick} />
    );

    const status = screen.getByTestId("watch-party-status");
    expect(status).toHaveTextContent("Upcoming");
    expect(status).toHaveClass("text-blue-500");
  });

  it("displays live status for current watch parties", () => {
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard watchParty={mockLiveWatchParty} onClick={mockOnClick} />
    );

    const status = screen.getByTestId("watch-party-status");
    expect(status).toHaveTextContent("Live");
    expect(status).toHaveClass("text-green-500");
  });

  it("displays ended status for past watch parties", () => {
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard watchParty={mockEndedWatchParty} onClick={mockOnClick} />
    );

    const status = screen.getByTestId("watch-party-status");
    expect(status).toHaveTextContent("Ended");
    expect(status).toHaveClass("text-muted-foreground");
  });

  it("calls onClick when card is clicked", () => {
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard watchParty={mockWatchParty} onClick={mockOnClick} />
    );

    const card = screen.getByTestId("watch-party-card");
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("shows 'Join party →' when user hasn't joined", () => {
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard watchParty={mockWatchParty} onClick={mockOnClick} />
    );

    const action = screen.getByTestId("watch-party-action");
    expect(action).toHaveTextContent("Join party →");
  });

  it("shows 'Joined →' when user has joined", () => {
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard watchParty={mockJoinedWatchParty} onClick={mockOnClick} />
    );

    const action = screen.getByTestId("watch-party-action");
    expect(action).toHaveTextContent("Joined →");
  });

  it("displays formatted date and time", () => {
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard watchParty={mockWatchParty} onClick={mockOnClick} />
    );

    const date = screen.getByTestId("watch-party-date");
    const time = screen.getByTestId("watch-party-time");

    expect(date).toBeInTheDocument();
    expect(time).toBeInTheDocument();

    // The exact format may vary by locale, but should contain date/time info
    expect(date.textContent).toBeTruthy();
    expect(time.textContent).toBeTruthy();
  });

  it("displays participant count", () => {
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard watchParty={mockWatchParty} onClick={mockOnClick} />
    );

    const participants = screen.getByTestId("watch-party-participants");
    expect(participants).toHaveTextContent("12 joined");
  });

  it("renders without description when showDescription is false", () => {
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard
        watchParty={mockWatchParty}
        onClick={mockOnClick}
        showDescription={false}
      />
    );

    expect(
      screen.getByText("Blade Runner 2049 Watch Party")
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Join us for a viewing of Denis Villeneuve's masterpiece sequel"
      )
    ).not.toBeInTheDocument();
  });

  it("renders without description when description is null", () => {
    const watchPartyWithoutDescription = {
      ...mockWatchParty,
      description: null,
    };
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard
        watchParty={watchPartyWithoutDescription}
        onClick={mockOnClick}
      />
    );

    expect(
      screen.getByText("Blade Runner 2049 Watch Party")
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Join us for a viewing of Denis Villeneuve's masterpiece sequel"
      )
    ).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard
        watchParty={mockWatchParty}
        onClick={mockOnClick}
        className="custom-watch-party-class"
      />
    );

    const card = screen.getByTestId("watch-party-card");
    expect(card).toHaveClass("custom-watch-party-class");
  });

  it("displays zero participants correctly", () => {
    const watchPartyWithNoParticipants = {
      ...mockWatchParty,
      participant_count: 0,
    };
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard
        watchParty={watchPartyWithNoParticipants}
        onClick={mockOnClick}
      />
    );

    const participants = screen.getByTestId("watch-party-participants");
    expect(participants).toHaveTextContent("0 joined");
  });

  it("has proper hover and transition classes", () => {
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard watchParty={mockWatchParty} onClick={mockOnClick} />
    );

    const card = screen.getByTestId("watch-party-card");
    expect(card).toHaveClass(
      "hover:bg-muted/50",
      "cursor-pointer",
      "transition-colors",
      "group"
    );
  });

  it("handles multiple clicks correctly", () => {
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard watchParty={mockWatchParty} onClick={mockOnClick} />
    );

    const card = screen.getByTestId("watch-party-card");

    fireEvent.click(card);
    fireEvent.click(card);
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledTimes(3);
  });

  it("renders with all required CSS classes", () => {
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard watchParty={mockWatchParty} onClick={mockOnClick} />
    );

    const card = screen.getByTestId("watch-party-card");
    expect(card).toHaveClass("p-4", "border", "border-border", "rounded-lg");
  });

  it("renders title with proper styling and hover effect", () => {
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard watchParty={mockWatchParty} onClick={mockOnClick} />
    );

    const title = screen.getByText("Blade Runner 2049 Watch Party");
    expect(title.tagName).toBe("H4");
    expect(title).toHaveClass(
      "font-medium",
      "text-foreground",
      "group-hover:text-primary",
      "transition-colors"
    );
  });

  it("renders description with proper styling when shown", () => {
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard watchParty={mockWatchParty} onClick={mockOnClick} />
    );

    const description = screen.getByText(
      "Join us for a viewing of Denis Villeneuve's masterpiece sequel"
    );
    expect(description.tagName).toBe("P");
    expect(description).toHaveClass(
      "text-sm",
      "text-muted-foreground",
      "mb-2",
      "line-clamp-2"
    );
  });

  it("renders footer with proper styling", () => {
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard watchParty={mockWatchParty} onClick={mockOnClick} />
    );

    const participants = screen.getByTestId("watch-party-participants");
    const footer = participants.closest(".flex.items-center.justify-between");
    expect(footer).toHaveClass("text-xs", "text-muted-foreground");
  });

  it("renders action text with accent color", () => {
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard watchParty={mockWatchParty} onClick={mockOnClick} />
    );

    const action = screen.getByTestId("watch-party-action");
    expect(action).toHaveClass("text-accent");
  });

  it("handles edge case: exactly 30 minutes before scheduled time", () => {
    const exactlyThirtyMinutesBefore = {
      ...mockWatchParty,
      scheduled_time: "2024-01-15T15:30:00Z", // Exactly 30 minutes after mock current time
    };

    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard
        watchParty={exactlyThirtyMinutesBefore}
        onClick={mockOnClick}
      />
    );

    const status = screen.getByTestId("watch-party-status");
    expect(status).toHaveTextContent("Live");
  });

  it("handles large participant count", () => {
    const watchPartyWithManyParticipants = {
      ...mockWatchParty,
      participant_count: 1234,
    };
    const mockOnClick = vi.fn();
    render(
      <WatchPartyCard
        watchParty={watchPartyWithManyParticipants}
        onClick={mockOnClick}
      />
    );

    const participants = screen.getByTestId("watch-party-participants");
    expect(participants).toHaveTextContent("1234 joined");
  });
});
