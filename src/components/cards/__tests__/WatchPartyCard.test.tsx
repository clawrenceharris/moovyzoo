import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { WatchPartyCard } from "../WatchPartyCard";
import type { WatchPartyWithParticipants } from "@/features/habitats/domain/habitats.types";

// Mock the TMDB service
vi.mock("@/utils/tmdb/service", () => ({
  tmdbService: {
    getPosterUrl: vi.fn((path: string, size: string) =>
      path ? `https://image.tmdb.org/t/p/${size}${path}` : ""
    ),
  },
}));

describe("WatchPartyCard", () => {
  const mockOnClick = vi.fn();

  const baseWatchParty: WatchPartyWithParticipants = {
    id: "1",
    habitat_id: "habitat-1",
    title: "Test Watch Party",
    description: "A test watch party description",
    scheduled_time: new Date("2024-12-25T20:00:00Z").toISOString(),
    participant_count: 5,
    max_participants: 10,
    created_by: "user-1",
    created_at: new Date().toISOString(),
    is_active: true,
    participants: [],
    is_participant: false,
  };

  const watchPartyWithMedia: WatchPartyWithParticipants = {
    ...baseWatchParty,
    tmdb_id: 27205,
    media_type: "movie",
    media_title: "Inception",
    poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    release_date: "2010-07-16",
    runtime: 148,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Functionality", () => {
    it("renders watch party title", () => {
      render(
        <WatchPartyCard watchParty={baseWatchParty} onClick={mockOnClick} />
      );

      expect(screen.getByText("Test Watch Party")).toBeInTheDocument();
    });

    it("renders watch party description when showDescription is true", () => {
      render(
        <WatchPartyCard
          watchParty={baseWatchParty}
          onClick={mockOnClick}
          showDescription={true}
        />
      );

      expect(
        screen.getByText("A test watch party description")
      ).toBeInTheDocument();
    });

    it("does not render description when showDescription is false", () => {
      render(
        <WatchPartyCard
          watchParty={baseWatchParty}
          onClick={mockOnClick}
          showDescription={false}
        />
      );

      expect(
        screen.queryByText("A test watch party description")
      ).not.toBeInTheDocument();
    });

    it("calls onClick when card is clicked", () => {
      render(
        <WatchPartyCard watchParty={baseWatchParty} onClick={mockOnClick} />
      );

      fireEvent.click(screen.getByTestId("watch-party-card"));
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("displays participant count", () => {
      render(
        <WatchPartyCard watchParty={baseWatchParty} onClick={mockOnClick} />
      );

      expect(screen.getByTestId("watch-party-participants")).toHaveTextContent(
        "5 joined"
      );
    });

    it("displays scheduled date and time", () => {
      render(
        <WatchPartyCard watchParty={baseWatchParty} onClick={mockOnClick} />
      );

      expect(screen.getByTestId("watch-party-date")).toBeInTheDocument();
      expect(screen.getByTestId("watch-party-time")).toBeInTheDocument();
    });
  });

  describe("Status Display", () => {
    it("shows 'Upcoming' status for future events", () => {
      const futureWatchParty = {
        ...baseWatchParty,
        scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      };

      render(
        <WatchPartyCard watchParty={futureWatchParty} onClick={mockOnClick} />
      );

      expect(screen.getByTestId("watch-party-status")).toHaveTextContent(
        "Upcoming"
      );
    });

    it("shows 'Live' status for current events", () => {
      const liveWatchParty = {
        ...baseWatchParty,
        scheduled_time: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
      };

      render(
        <WatchPartyCard watchParty={liveWatchParty} onClick={mockOnClick} />
      );

      expect(screen.getByTestId("watch-party-status")).toHaveTextContent(
        "Live"
      );
    });

    it("shows 'Ended' status for past events", () => {
      const pastWatchParty = {
        ...baseWatchParty,
        scheduled_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      };

      render(
        <WatchPartyCard watchParty={pastWatchParty} onClick={mockOnClick} />
      );

      expect(screen.getByTestId("watch-party-status")).toHaveTextContent(
        "Ended"
      );
    });
  });

  describe("Participation Status", () => {
    it("shows 'Join party →' for non-participants", () => {
      render(
        <WatchPartyCard watchParty={baseWatchParty} onClick={mockOnClick} />
      );

      expect(screen.getByTestId("watch-party-action")).toHaveTextContent(
        "Join party →"
      );
    });

    it("shows 'Joined →' for participants", () => {
      const participantWatchParty = {
        ...baseWatchParty,
        is_participant: true,
      };

      render(
        <WatchPartyCard
          watchParty={participantWatchParty}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByTestId("watch-party-action")).toHaveTextContent(
        "Joined →"
      );
    });
  });

  describe("Media Display", () => {
    it("displays media information when showMediaInfo is true and media exists", () => {
      render(
        <WatchPartyCard
          watchParty={watchPartyWithMedia}
          onClick={mockOnClick}
          showMediaInfo={true}
        />
      );

      expect(screen.getByTestId("watch-party-media-title")).toHaveTextContent(
        "Inception"
      );
      expect(screen.getByTestId("watch-party-media-type")).toHaveTextContent(
        "Movie"
      );
      expect(screen.getByTestId("watch-party-release-year")).toHaveTextContent(
        "2010"
      );
      expect(screen.getByTestId("watch-party-runtime")).toHaveTextContent(
        "2h 28m"
      );
    });

    it("displays poster image when available", () => {
      render(
        <WatchPartyCard
          watchParty={watchPartyWithMedia}
          onClick={mockOnClick}
          showMediaInfo={true}
        />
      );

      const poster = screen.getByTestId("watch-party-poster");
      expect(poster).toBeInTheDocument();
      expect(poster).toHaveAttribute(
        "src",
        "https://image.tmdb.org/t/p/w342/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"
      );
      expect(poster).toHaveAttribute("alt", "Inception poster");
    });

    it("displays fallback placeholder when poster is not available", () => {
      const watchPartyNoPoster = {
        ...watchPartyWithMedia,
        poster_path: undefined,
      };

      render(
        <WatchPartyCard
          watchParty={watchPartyNoPoster}
          onClick={mockOnClick}
          showMediaInfo={true}
        />
      );

      expect(
        screen.getByTestId("watch-party-poster-fallback")
      ).toBeInTheDocument();
    });

    it("displays TV show media type correctly", () => {
      const tvWatchParty = {
        ...watchPartyWithMedia,
        media_type: "tv" as const,
        media_title: "Breaking Bad",
      };

      render(
        <WatchPartyCard
          watchParty={tvWatchParty}
          onClick={mockOnClick}
          showMediaInfo={true}
        />
      );

      expect(screen.getByTestId("watch-party-media-type")).toHaveTextContent(
        "TV Show"
      );
    });

    it("does not display media information when showMediaInfo is false", () => {
      render(
        <WatchPartyCard
          watchParty={watchPartyWithMedia}
          onClick={mockOnClick}
          showMediaInfo={false}
        />
      );

      expect(
        screen.queryByTestId("watch-party-media-title")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("watch-party-poster")
      ).not.toBeInTheDocument();
    });

    it("does not display media information when no media exists", () => {
      render(
        <WatchPartyCard
          watchParty={baseWatchParty}
          onClick={mockOnClick}
          showMediaInfo={true}
        />
      );

      expect(
        screen.queryByTestId("watch-party-media-title")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("watch-party-poster")
      ).not.toBeInTheDocument();
    });

    it("handles runtime display correctly for different durations", () => {
      const shortRuntimeParty = {
        ...watchPartyWithMedia,
        runtime: 45, // 45 minutes
      };

      render(
        <WatchPartyCard
          watchParty={shortRuntimeParty}
          onClick={mockOnClick}
          showMediaInfo={true}
        />
      );

      expect(screen.getByTestId("watch-party-runtime")).toHaveTextContent(
        "45m"
      );
    });

    it("does not display runtime when not available", () => {
      const noRuntimeParty = {
        ...watchPartyWithMedia,
        runtime: undefined,
      };

      render(
        <WatchPartyCard
          watchParty={noRuntimeParty}
          onClick={mockOnClick}
          showMediaInfo={true}
        />
      );

      expect(
        screen.queryByTestId("watch-party-runtime")
      ).not.toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("applies custom className", () => {
      render(
        <WatchPartyCard
          watchParty={baseWatchParty}
          onClick={mockOnClick}
          className="custom-class"
        />
      );

      const card = screen.getByTestId("watch-party-card");
      expect(card).toHaveClass("custom-class");
    });

    it("maintains responsive classes for mobile and desktop", () => {
      render(
        <WatchPartyCard
          watchParty={watchPartyWithMedia}
          onClick={mockOnClick}
          showMediaInfo={true}
        />
      );

      const poster = screen.getByTestId("watch-party-poster");
      expect(poster).toHaveClass("w-16", "h-24", "sm:w-20", "sm:h-30");
    });
  });

  describe("Error Handling", () => {
    it("handles image load errors gracefully", () => {
      render(
        <WatchPartyCard
          watchParty={watchPartyWithMedia}
          onClick={mockOnClick}
          showMediaInfo={true}
        />
      );

      const poster = screen.getByTestId("watch-party-poster");

      // Simulate image load error
      fireEvent.error(poster);

      // The fallback should become visible
      expect(screen.getByTestId("watch-party-poster-fallback")).not.toHaveClass(
        "hidden"
      );
    });
  });

  describe("Accessibility", () => {
    it("has proper alt text for poster images", () => {
      render(
        <WatchPartyCard
          watchParty={watchPartyWithMedia}
          onClick={mockOnClick}
          showMediaInfo={true}
        />
      );

      const poster = screen.getByTestId("watch-party-poster");
      expect(poster).toHaveAttribute("alt", "Inception poster");
    });

    it("maintains keyboard accessibility", () => {
      render(
        <WatchPartyCard watchParty={baseWatchParty} onClick={mockOnClick} />
      );

      const card = screen.getByTestId("watch-party-card");
      expect(card).toHaveClass("cursor-pointer");
    });
  });
});
