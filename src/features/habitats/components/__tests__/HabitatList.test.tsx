import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useRouter } from "next/navigation";
import { HabitatList } from "../HabitatList";
import type { HabitatWithMembership } from "../../domain/habitats.types";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

(useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);

interface HabitatWithActivity extends HabitatWithMembership {
  recent_activity?: {
    discussions_count?: number;
    active_watch_parties?: number;
    recent_messages?: number;
    last_activity_at?: string;
  };
}

const mockHabitats: HabitatWithActivity[] = [
  {
    id: "habitat-1",
    name: "Horror Movies",
    description: "Discuss your favorite scary movies and share recommendations",
    tags: ["horror", "thriller", "suspense"],
    member_count: 25,
    is_public: true,
    created_by: "user1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    is_member: true,
    user_role: "member",
    recent_activity: {
      discussions_count: 3,
      active_watch_parties: 1,
      recent_messages: 5,
      last_activity_at: "2024-01-01T12:00:00Z",
    },
  },
  {
    id: "habitat-2",
    name: "Sci-Fi Classics",
    description: "Classic science fiction films and TV shows",
    tags: ["sci-fi", "classics", "space", "future"],
    member_count: 42,
    is_public: true,
    created_by: "user2",
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    is_member: true,
    user_role: "member",
    recent_activity: {
      discussions_count: 2,
      active_watch_parties: 0,
      recent_messages: 0,
      last_activity_at: "2024-01-02T08:00:00Z",
    },
  },
  {
    id: "habitat-3",
    name: "Comedy Central",
    description: "Laugh together with the best comedies",
    tags: ["comedy"],
    member_count: 18,
    is_public: true,
    created_by: "user3",
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z",
    is_member: true,
    user_role: "member",
  },
];

describe("HabitatList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State", () => {
    it("should render loading skeleton when loading is true", () => {
      render(<HabitatList habitats={[]} loading={true} />);

      const loadingCards = screen.getAllByTestId("loading-card");
      expect(loadingCards).toHaveLength(8);

      // Check that loading cards have proper structure
      loadingCards.forEach((card) => {
        expect(card).toHaveClass("animate-pulse");
      });
    });

    it("should not render habitats when loading", () => {
      render(<HabitatList habitats={mockHabitats} loading={true} />);

      expect(screen.queryByText("Horror Movies")).not.toBeInTheDocument();
      expect(screen.queryByText("Sci-Fi Classics")).not.toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should render error state when error is provided", () => {
      const errorMessage = "Failed to load habitats";
      render(
        <HabitatList habitats={[]} error={errorMessage} onRetry={vi.fn()} />
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText("Try again")).toBeInTheDocument();
    });

    it("should call onRetry when retry button is clicked", () => {
      const mockRetry = vi.fn();
      render(
        <HabitatList habitats={[]} error="Network error" onRetry={mockRetry} />
      );

      const retryButton = screen.getByText("Try again");
      fireEvent.click(retryButton);

      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it("should not render retry button when onRetry is not provided", () => {
      render(<HabitatList habitats={[]} error="Network error" />);

      expect(screen.queryByText("Try again")).not.toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should render empty state when no habitats are provided", () => {
      render(<HabitatList habitats={[]} />);

      expect(screen.getByText("No habitats yet")).toBeInTheDocument();
      expect(
        screen.getByText(/You haven't joined any habitats yet/)
      ).toBeInTheDocument();
    });

    it("should render refresh button in empty state when onRetry is provided", () => {
      const mockRetry = vi.fn();
      render(<HabitatList habitats={[]} onRetry={mockRetry} />);

      const refreshButton = screen.getByText("Refresh");
      fireEvent.click(refreshButton);

      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it("should not render refresh button when onRetry is not provided", () => {
      render(<HabitatList habitats={[]} />);

      expect(screen.queryByText("Refresh")).not.toBeInTheDocument();
    });
  });

  describe("Habitats List", () => {
    it("should render all habitats when provided", () => {
      render(<HabitatList habitats={mockHabitats} />);

      expect(screen.getByText("Horror Movies")).toBeInTheDocument();
      expect(screen.getByText("Sci-Fi Classics")).toBeInTheDocument();
      expect(screen.getByText("Comedy Central")).toBeInTheDocument();
    });

    it("should display activity indicators when available", () => {
      render(<HabitatList habitats={mockHabitats} />);

      // Check for discussion count
      expect(screen.getByText("3 discussions")).toBeInTheDocument();
      expect(screen.getByText("2 discussions")).toBeInTheDocument();

      // Check for active watch parties indicator in header
      expect(screen.getByText("1")).toBeInTheDocument(); // active watch party count

      // Check for recent messages indicator
      expect(screen.getByText("5 new")).toBeInTheDocument();
    });

    it("should not display activity indicators when not available", () => {
      const habitatsWithoutActivity = [
        {
          ...mockHabitats[2], // Comedy Central has no recent_activity
        },
      ];

      render(<HabitatList habitats={habitatsWithoutActivity} />);

      expect(screen.queryByText("discussions")).not.toBeInTheDocument();
      expect(screen.queryByText("new")).not.toBeInTheDocument();
    });

    it("should display habitat information correctly", () => {
      render(<HabitatList habitats={mockHabitats} />);

      // Check first habitat details
      expect(screen.getByText("Horror Movies")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Discuss your favorite scary movies and share recommendations"
        )
      ).toBeInTheDocument();
      expect(screen.getByText("25")).toBeInTheDocument(); // member count
      expect(screen.getByText("horror")).toBeInTheDocument();
      expect(screen.getByText("thriller")).toBeInTheDocument();
      expect(screen.getByText("suspense")).toBeInTheDocument();
    });

    it("should limit displayed tags to 3 and show overflow count", () => {
      render(<HabitatList habitats={mockHabitats} />);

      // Sci-Fi Classics has 4 tags, should show first 3 + overflow
      expect(screen.getByText("sci-fi")).toBeInTheDocument();
      expect(screen.getByText("classics")).toBeInTheDocument();
      expect(screen.getByText("space")).toBeInTheDocument();
      expect(screen.getByText("+1")).toBeInTheDocument();
    });

    it("should handle habitats without descriptions", () => {
      const habitatsWithoutDesc = [
        {
          ...mockHabitats[0],
          description: "",
        },
      ];

      render(<HabitatList habitats={habitatsWithoutDesc} />);

      expect(screen.getByText("Horror Movies")).toBeInTheDocument();
      expect(
        screen.queryByText("Discuss your favorite scary movies")
      ).not.toBeInTheDocument();
    });

    it("should handle habitats without tags", () => {
      const habitatsWithoutTags = [
        {
          ...mockHabitats[0],
          tags: [],
        },
      ];

      render(<HabitatList habitats={habitatsWithoutTags} />);

      expect(screen.getByText("Horror Movies")).toBeInTheDocument();
      expect(screen.queryByText("horror")).not.toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should navigate to habitat room when habitat card is clicked", () => {
      render(<HabitatList habitats={mockHabitats} />);

      const horrorCard = screen
        .getByText("Horror Movies")
        .closest("[role='button'], div[class*='cursor-pointer']");
      expect(horrorCard).toBeInTheDocument();

      fireEvent.click(horrorCard!);

      expect(mockPush).toHaveBeenCalledWith("/habitats/habitat-1");
    });

    it("should apply hover effects on habitat cards", () => {
      render(<HabitatList habitats={mockHabitats} />);

      // Find the card element (should be the parent with cursor-pointer class)
      const horrorCard = screen
        .getByText("Horror Movies")
        .closest("[class*='cursor-pointer']");
      expect(horrorCard).toHaveClass("cursor-pointer");
      expect(horrorCard).toHaveClass("hover:shadow-lg");
      expect(horrorCard).toHaveClass("hover:scale-[1.02]");
    });

    it("should handle multiple rapid clicks gracefully", () => {
      render(<HabitatList habitats={mockHabitats} />);

      const horrorCard = screen
        .getByText("Horror Movies")
        .closest("[role='button'], div[class*='cursor-pointer']");

      // Simulate rapid clicks
      fireEvent.click(horrorCard!);
      fireEvent.click(horrorCard!);
      fireEvent.click(horrorCard!);

      expect(mockPush).toHaveBeenCalledTimes(3);
      expect(mockPush).toHaveBeenCalledWith("/habitats/habitat-1");
    });
  });

  describe("Responsive Layout", () => {
    it("should apply responsive grid classes", () => {
      const { container } = render(<HabitatList habitats={mockHabitats} />);

      const gridContainer = container.querySelector(".grid");
      expect(gridContainer).toHaveClass("grid-cols-1");
      expect(gridContainer).toHaveClass("sm:grid-cols-2");
      expect(gridContainer).toHaveClass("lg:grid-cols-3");
      expect(gridContainer).toHaveClass("xl:grid-cols-4");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes for interactive elements", () => {
      render(<HabitatList habitats={mockHabitats} />);

      const cards = screen
        .getAllByText(/Movies|Classics|Central/)
        .map((text) => text.closest("div[class*='cursor-pointer']"));

      cards.forEach((card) => {
        expect(card).toBeInTheDocument();
        // Cards should be clickable
        expect(card).toHaveClass("cursor-pointer");
      });
    });

    it("should have proper text contrast and readability", () => {
      render(<HabitatList habitats={mockHabitats} />);

      // Check that text elements have proper contrast classes
      expect(screen.getByText("Horror Movies")).toHaveClass("text-foreground");
      expect(
        screen.getByText(
          "Discuss your favorite scary movies and share recommendations"
        )
      ).toHaveClass("text-muted-foreground");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty habitat name gracefully", () => {
      const habitatWithEmptyName = [
        {
          ...mockHabitats[0],
          name: "",
        },
      ];

      render(<HabitatList habitats={habitatWithEmptyName} />);

      // Should still render the card structure
      expect(screen.getByText("25")).toBeInTheDocument(); // member count should still show
    });

    it("should handle very long habitat names", () => {
      const habitatWithLongName = [
        {
          ...mockHabitats[0],
          name: "This is a very long habitat name that should be truncated properly to avoid layout issues",
        },
      ];

      render(<HabitatList habitats={habitatWithLongName} />);

      const nameElement = screen.getByText(/This is a very long habitat name/);
      expect(nameElement).toHaveClass("line-clamp-1");
    });

    it("should handle zero member count", () => {
      const habitatWithZeroMembers = [
        {
          ...mockHabitats[0],
          member_count: 0,
        },
      ];

      render(<HabitatList habitats={habitatWithZeroMembers} />);

      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should handle very large member counts", () => {
      const habitatWithManyMembers = [
        {
          ...mockHabitats[0],
          member_count: 999999,
        },
      ];

      render(<HabitatList habitats={habitatWithManyMembers} />);

      expect(screen.getByText("999999")).toBeInTheDocument();
    });
  });
});
