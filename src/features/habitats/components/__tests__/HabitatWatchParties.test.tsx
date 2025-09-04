import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { HabitatWatchParties } from "../HabitatWatchParties";
import type { WatchPartyWithParticipants } from "../../domain/habitats.types";

// Mock child components
vi.mock("@/components", () => ({
  WatchPartyCard: ({ watchParty, onClick }: any) => (
    <div
      data-testid={`watch-party-card-${watchParty.id}`}
      onClick={onClick}
      role="button"
    >
      <h4>{watchParty.title}</h4>
      <span>{watchParty.participant_count} participants</span>
    </div>
  ),
  LoadingState: ({ variant, count }: any) => (
    <div data-testid="loading-state" data-variant={variant} data-count={count}>
      Loading watch parties...
    </div>
  ),
  EmptyState: ({ title, description, onAction, variant }: any) => (
    <div data-testid="empty-state" data-variant={variant}>
      <h3>{title}</h3>
      <p>{description}</p>
      {onAction}
    </div>
  ),
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/carousel", () => ({
  Carousel: ({ children, opts }: any) => (
    <div data-testid="carousel" data-opts={JSON.stringify(opts)}>
      {children}
    </div>
  ),
  CarouselContent: ({ children, className }: any) => (
    <div data-testid="carousel-content" className={className}>
      {children}
    </div>
  ),
  CarouselItem: ({ children, className }: any) => (
    <div data-testid="carousel-item" className={className}>
      {children}
    </div>
  ),
  CarouselNext: ({ className }: any) => (
    <button data-testid="carousel-next" className={className}>
      Next
    </button>
  ),
  CarouselPrevious: ({ className }: any) => (
    <button data-testid="carousel-previous" className={className}>
      Previous
    </button>
  ),
}));

describe("HabitatWatchParties", () => {
  const mockWatchParties: WatchPartyWithParticipants[] = [
    {
      id: "party-1",
      habitat_id: "habitat-1",
      title: "Dune Marathon",
      description: "Let's watch all Dune movies together",
      scheduled_time: "2024-01-02T20:00:00Z", // Future
      participant_count: 5,
      max_participants: 20,
      created_by: "user-1",
      created_at: "2024-01-01T00:00:00Z",
      is_active: true,
      participants: [],
      user_is_participant: false,
    },
    {
      id: "party-2",
      habitat_id: "habitat-1",
      title: "Star Trek Night",
      description: "Classic Star Trek episodes",
      scheduled_time: "2024-01-01T19:00:00Z", // Live (within 30 min of now)
      participant_count: 12,
      max_participants: 15,
      created_by: "user-2",
      created_at: "2024-01-01T00:00:00Z",
      is_active: true,
      participants: [],
      user_is_participant: true,
    },
    {
      id: "party-3",
      habitat_id: "habitat-1",
      title: "Blade Runner Discussion",
      description: "Post-movie discussion",
      scheduled_time: "2023-12-31T18:00:00Z", // Past
      participant_count: 8,
      max_participants: 10,
      created_by: "user-3",
      created_at: "2023-12-31T00:00:00Z",
      is_active: false,
      participants: [],
      user_is_participant: false,
    },
  ];

  const defaultProps = {
    watchParties: mockWatchParties,
    onJoinParty: vi.fn(),
    onLeaveParty: vi.fn(),
    onEnterParty: vi.fn(),
    onCreateParty: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date.now() to return a consistent time for testing
    vi.spyOn(Date, "now").mockReturnValue(
      new Date("2024-01-01T19:15:00Z").getTime()
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Loading State", () => {
    it("should display loading state when loading is true", () => {
      // Act
      render(<HabitatWatchParties {...defaultProps} loading={true} />);

      // Assert
      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
      expect(screen.getByTestId("loading-state")).toHaveAttribute(
        "data-variant",
        "grid"
      );
      expect(screen.getByTestId("loading-state")).toHaveAttribute(
        "data-count",
        "3"
      );
    });

    it("should display watch parties header during loading", () => {
      // Act
      render(<HabitatWatchParties {...defaultProps} loading={true} />);

      // Assert
      expect(screen.getByText("Watch Parties")).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should display empty state when no watch parties are available", () => {
      // Act
      render(<HabitatWatchParties {...defaultProps} watchParties={[]} />);

      // Assert
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(
        screen.getByText("Schedule a Watch Party to start the fun!")
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Be the first to schedule a watch party and bring the community together!"
        )
      ).toBeInTheDocument();
    });

    it("should display create party button in empty state when onCreateParty is provided", () => {
      // Act
      render(<HabitatWatchParties {...defaultProps} watchParties={[]} />);

      // Assert
      expect(screen.getByTestId("empty-state")).toHaveAttribute(
        "data-variant",
        "minimal"
      );
    });
  });

  describe("Watch Parties Display", () => {
    it("should render watch party cards when parties are available", () => {
      // Act
      render(<HabitatWatchParties {...defaultProps} />);

      // Assert
      expect(
        screen.getByTestId("watch-party-card-party-1")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("watch-party-card-party-2")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("watch-party-card-party-3")
      ).toBeInTheDocument();
      expect(screen.getByText("Dune Marathon")).toBeInTheDocument();
      expect(screen.getByText("Star Trek Night")).toBeInTheDocument();
      expect(screen.getByText("Blade Runner Discussion")).toBeInTheDocument();
    });

    it("should display correct party count in header", () => {
      // Act
      render(<HabitatWatchParties {...defaultProps} />);

      // Assert
      expect(screen.getByText("3 parties scheduled")).toBeInTheDocument();
    });

    it("should display singular form for single party", () => {
      // Arrange
      const singleParty = [mockWatchParties[0]];

      // Act
      render(
        <HabitatWatchParties {...defaultProps} watchParties={singleParty} />
      );

      // Assert
      expect(screen.getByText("1 party scheduled")).toBeInTheDocument();
    });

    it("should call onEnterParty when watch party card is clicked", () => {
      // Act
      render(<HabitatWatchParties {...defaultProps} />);

      // Click on first party
      fireEvent.click(screen.getByTestId("watch-party-card-party-1"));

      // Assert
      expect(defaultProps.onEnterParty).toHaveBeenCalledWith("party-1");
    });
  });

  describe("Party Sorting", () => {
    it("should sort parties by status priority (live, upcoming, past)", () => {
      // Act
      render(<HabitatWatchParties {...defaultProps} />);

      // Assert
      const carouselItems = screen.getAllByTestId("carousel-item");
      expect(carouselItems).toHaveLength(3);

      // The order should be: live (party-2), upcoming (party-1), past (party-3)
      // We can verify this by checking the order of watch party cards
      const watchPartyCards = screen.getAllByRole("button");
      const cardTexts = watchPartyCards.map((card) => card.textContent);

      // Live party should come first
      expect(cardTexts[0]).toContain("Star Trek Night");
      // Upcoming party should come second
      expect(cardTexts[1]).toContain("Dune Marathon");
      // Past party should come last
      expect(cardTexts[2]).toContain("Blade Runner Discussion");
    });
  });

  describe("Carousel Navigation", () => {
    it("should render carousel with correct options", () => {
      // Act
      render(<HabitatWatchParties {...defaultProps} />);

      // Assert
      const carousel = screen.getByTestId("carousel");
      const opts = JSON.parse(carousel.getAttribute("data-opts") || "{}");
      expect(opts).toEqual({
        align: "start",
        loop: false,
        skipSnaps: false,
        dragFree: false,
      });
    });

    it("should show navigation arrows when there are more than 4 parties", () => {
      // Arrange
      const manyParties = Array.from({ length: 6 }, (_, i) => ({
        ...mockWatchParties[0],
        id: `party-${i + 1}`,
        title: `Party ${i + 1}`,
      }));

      // Act
      render(
        <HabitatWatchParties {...defaultProps} watchParties={manyParties} />
      );

      // Assert
      expect(screen.getByTestId("carousel-next")).toBeInTheDocument();
      expect(screen.getByTestId("carousel-previous")).toBeInTheDocument();
    });

    it("should not show navigation arrows when there are 4 or fewer parties", () => {
      // Act
      render(<HabitatWatchParties {...defaultProps} />);

      // Assert
      expect(screen.queryByTestId("carousel-next")).not.toBeInTheDocument();
      expect(screen.queryByTestId("carousel-previous")).not.toBeInTheDocument();
    });
  });

  describe("Header and Actions", () => {
    it("should display watch parties header", () => {
      // Act
      render(<HabitatWatchParties {...defaultProps} />);

      // Assert
      expect(screen.getByText("Watch Parties")).toBeInTheDocument();
    });

    it("should display schedule party button when onCreateParty is provided", () => {
      // Act
      render(<HabitatWatchParties {...defaultProps} />);

      // Assert
      expect(screen.getByText("Schedule Party")).toBeInTheDocument();
    });

    it("should not display schedule party button when onCreateParty is not provided", () => {
      // Act
      render(
        <HabitatWatchParties {...defaultProps} onCreateParty={undefined} />
      );

      // Assert
      expect(screen.queryByText("Schedule Party")).not.toBeInTheDocument();
    });

    it("should call onCreateParty when schedule party button is clicked", () => {
      // Act
      render(<HabitatWatchParties {...defaultProps} />);

      // Click schedule party button
      fireEvent.click(screen.getByText("Schedule Party"));

      // Assert
      expect(defaultProps.onCreateParty).toHaveBeenCalledTimes(1);
    });
  });

  describe("Styling and Layout", () => {
    it("should apply custom className", () => {
      // Act
      const { container } = render(
        <HabitatWatchParties {...defaultProps} className="custom-class" />
      );

      // Assert
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should have proper card styling", () => {
      // Act
      render(<HabitatWatchParties {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("card")).toHaveClass("bg-primary-surface");
    });

    it("should have proper carousel item responsive classes", () => {
      // Act
      render(<HabitatWatchParties {...defaultProps} />);

      // Assert
      const carouselItems = screen.getAllByTestId("carousel-item");
      carouselItems.forEach((item) => {
        expect(item).toHaveClass(
          "pl-2",
          "md:pl-4",
          "basis-full",
          "sm:basis-1/2",
          "lg:basis-1/3",
          "xl:basis-1/4"
        );
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading structure", () => {
      // Act
      render(<HabitatWatchParties {...defaultProps} />);

      // Assert
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Watch Parties"
      );
    });

    it("should have accessible button for scheduling parties", () => {
      // Act
      render(<HabitatWatchParties {...defaultProps} />);

      // Assert
      expect(
        screen.getByRole("button", { name: /schedule party/i })
      ).toBeInTheDocument();
    });

    it("should have clickable watch party cards with proper role", () => {
      // Act
      render(<HabitatWatchParties {...defaultProps} />);

      // Assert
      const watchPartyCards = screen.getAllByRole("button");
      expect(watchPartyCards.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle watch parties with missing optional fields", () => {
      // Arrange
      const partiesWithMissingFields = [
        {
          ...mockWatchParties[0],
          description: undefined,
          max_participants: null,
        },
      ];

      // Act & Assert
      expect(() => {
        render(
          <HabitatWatchParties
            {...defaultProps}
            watchParties={partiesWithMissingFields as any}
          />
        );
      }).not.toThrow();
    });

    it("should handle undefined callback functions gracefully", () => {
      // Act & Assert
      expect(() => {
        render(
          <HabitatWatchParties
            {...defaultProps}
            onJoinParty={undefined as any}
            onLeaveParty={undefined as any}
            onEnterParty={undefined as any}
          />
        );
      }).not.toThrow();
    });

    it("should handle parties with invalid dates", () => {
      // Arrange
      const partiesWithInvalidDates = [
        {
          ...mockWatchParties[0],
          scheduled_time: "invalid-date",
        },
      ];

      // Act & Assert
      expect(() => {
        render(
          <HabitatWatchParties
            {...defaultProps}
            watchParties={partiesWithInvalidDates as any}
          />
        );
      }).not.toThrow();
    });
  });
});
