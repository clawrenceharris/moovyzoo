import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRouter } from "next/navigation";
import { HabitatDashboard } from "../HabitatDashboard";
import { habitatsService } from "../../domain/habitats.service";
import { normalizeError } from "@/utils/normalize-error";
import type { HabitatDashboardData } from "../../domain/habitats.types";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("../../domain/habitats.service", () => ({
  habitatsService: {
    getDashboardData: vi.fn(),
  },
}));

vi.mock("@/utils/normalize-error", () => ({
  normalizeError: vi.fn(),
}));

// Mock child components
vi.mock("../HabitatHero", () => ({
  HabitatHero: ({ habitat, onStartStreamingParty, onCreatePoll }: any) => (
    <div data-testid="habitat-hero">
      <h1>{habitat.name}</h1>
      <button onClick={onStartStreamingParty}>Start Streaming Party</button>
      <button onClick={onCreatePoll}>Create Poll</button>
    </div>
  ),
}));

vi.mock("../HabitatDiscussions", () => ({
  HabitatDiscussions: ({ discussions, onDiscussionClick }: any) => (
    <div data-testid="habitat-discussions">
      {discussions.map((discussion: any) => (
        <button
          key={discussion.id}
          onClick={() => onDiscussionClick(discussion.id)}
        >
          {discussion.name}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("../HabitatWatchParties", () => ({
  HabitatWatchParties: ({ watchParties, onCreateParty }: any) => (
    <div data-testid="habitat-watch-parties">
      <span>{watchParties.length} parties</span>
      <button onClick={onCreateParty}>Create Party</button>
    </div>
  ),
}));

vi.mock("../HabitatInfo", () => ({
  HabitatInfo: ({ habitat, members }: any) => (
    <div data-testid="habitat-info">
      <span>{habitat.name} Info</span>
      <span>{members.length} members</span>
    </div>
  ),
}));

vi.mock("../PollCreationModal", () => ({
  PollCreationModal: ({ isOpen, onClose, onSuccess }: any) =>
    isOpen ? (
      <div data-testid="poll-creation-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={() => onSuccess({ id: "poll-1" })}>Create Poll</button>
      </div>
    ) : null,
}));

vi.mock("../WatchPartyCreationModal", () => ({
  WatchPartyCreationModal: ({ isOpen, onClose, onSuccess }: any) =>
    isOpen ? (
      <div data-testid="watch-party-creation-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={() => onSuccess({ id: "party-1" })}>
          Create Watch Party
        </button>
      </div>
    ) : null,
}));

vi.mock("@/components", () => ({
  LoadingState: ({ variant }: any) => (
    <div data-testid="loading-state" data-variant={variant}>
      Loading...
    </div>
  ),
  ErrorState: ({ title, message, onRetry }: any) => (
    <div data-testid="error-state">
      <h2>{title}</h2>
      <p>{message}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}));

describe("HabitatDashboard", () => {
  const mockRouter = {
    push: vi.fn(),
  };

  const mockDashboardData: HabitatDashboardData = {
    habitat: {
      id: "habitat-1",
      name: "Test Habitat",
      description: "Test Description",
      tags: ["sci-fi"],
      member_count: 10,
      is_public: true,
      created_by: "user-1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      is_member: true,
      role: "member",
    },
    discussions: [
      {
        id: "discussion-1",
        habitat_id: "habitat-1",
        name: "Test Discussion",
        description: "Test Description",
        created_by: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        is_active: true,
        message_count: 5,
        last_message_at: "2024-01-01T00:00:00Z",
      },
    ],
    watchParties: [
      {
        id: "party-1",
        habitat_id: "habitat-1",
        title: "Test Party",
        description: "Test Description",
        scheduled_time: "2024-01-01T00:00:00Z",
        participant_count: 3,
        max_participants: 10,
        created_by: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        is_active: true,
        participants: [],
        user_is_participant: false,
      },
    ],
    members: [
      {
        habitat_id: "habitat-1",
        user_id: "user-1",
        joined_at: "2024-01-01T00:00:00Z",
        last_active: "2024-01-01T00:00:00Z",
      },
    ],
    onlineMembers: ["user-1"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  describe("Loading State", () => {
    it("should display loading state when fetching dashboard data", () => {
      // Arrange
      vi.mocked(habitatsService.getDashboardData).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      // Assert
      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
      expect(screen.getByTestId("loading-state")).toHaveAttribute(
        "data-variant",
        "grid"
      );
    });

    it("should call getDashboardData with correct parameters", async () => {
      // Arrange
      vi.mocked(habitatsService.getDashboardData).mockResolvedValue(
        mockDashboardData
      );

      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      // Assert
      await waitFor(() => {
        expect(habitatsService.getDashboardData).toHaveBeenCalledWith(
          "habitat-1",
          "user-1"
        );
      });
    });
  });

  describe("Error State", () => {
    it("should display error state when dashboard data fetch fails", async () => {
      // Arrange
      const error = new Error("Network error");
      const normalizedError = { message: "Failed to load habitat data" };
      vi.mocked(habitatsService.getDashboardData).mockRejectedValue(error);
      vi.mocked(normalizeError).mockReturnValue(normalizedError);

      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId("error-state")).toBeInTheDocument();
      });
      expect(screen.getByText("Unable to load habitat")).toBeInTheDocument();
      expect(
        screen.getByText("Failed to load habitat data")
      ).toBeInTheDocument();
    });

    it("should retry fetching data when retry button is clicked", async () => {
      // Arrange
      const error = new Error("Network error");
      const normalizedError = { message: "Failed to load habitat data" };
      vi.mocked(habitatsService.getDashboardData)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockDashboardData);
      vi.mocked(normalizeError).mockReturnValue(normalizedError);

      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByTestId("error-state")).toBeInTheDocument();
      });

      // Click retry
      fireEvent.click(screen.getByText("Retry"));

      // Assert
      await waitFor(() => {
        expect(habitatsService.getDashboardData).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Dashboard Content", () => {
    beforeEach(() => {
      vi.mocked(habitatsService.getDashboardData).mockResolvedValue(
        mockDashboardData
      );
    });

    it("should render dashboard content when data is loaded", async () => {
      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId("habitat-hero")).toBeInTheDocument();
        expect(screen.getByTestId("habitat-discussions")).toBeInTheDocument();
        expect(screen.getByTestId("habitat-watch-parties")).toBeInTheDocument();
        expect(screen.getByTestId("habitat-info")).toBeInTheDocument();
      });
    });

    it("should display breadcrumb navigation", async () => {
      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Habitats")).toBeInTheDocument();
        expect(screen.getByText("Test Habitat")).toBeInTheDocument();
      });
    });

    it("should navigate to habitats page when breadcrumb is clicked", async () => {
      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText("Habitats")).toBeInTheDocument();
      });

      // Click breadcrumb
      fireEvent.click(screen.getByText("Habitats"));

      // Assert
      expect(mockRouter.push).toHaveBeenCalledWith("/habitats");
    });
  });

  describe("Modal Management", () => {
    beforeEach(() => {
      vi.mocked(habitatsService.getDashboardData).mockResolvedValue(
        mockDashboardData
      );
    });

    it("should open poll creation modal when Create Poll is clicked", async () => {
      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText("Create Poll")).toBeInTheDocument();
      });

      // Click Create Poll button
      fireEvent.click(screen.getByText("Create Poll"));

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId("poll-creation-modal")).toBeInTheDocument();
      });
    });

    it("should open watch party creation modal when Start Streaming Party is clicked", async () => {
      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText("Start Streaming Party")).toBeInTheDocument();
      });

      // Click Start Streaming Party button
      fireEvent.click(screen.getByText("Start Streaming Party"));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByTestId("watch-party-creation-modal")
        ).toBeInTheDocument();
      });
    });

    it("should close modal when close button is clicked", async () => {
      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText("Create Poll")).toBeInTheDocument();
      });

      // Open modal
      fireEvent.click(screen.getByText("Create Poll"));

      await waitFor(() => {
        expect(screen.getByTestId("poll-creation-modal")).toBeInTheDocument();
      });

      // Close modal
      fireEvent.click(screen.getByText("Close"));

      // Assert
      await waitFor(() => {
        expect(
          screen.queryByTestId("poll-creation-modal")
        ).not.toBeInTheDocument();
      });
    });

    it("should refresh dashboard data when poll is created successfully", async () => {
      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText("Create Poll")).toBeInTheDocument();
      });

      // Open modal and create poll
      fireEvent.click(screen.getByText("Create Poll"));

      await waitFor(() => {
        expect(screen.getByTestId("poll-creation-modal")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Create Poll"));

      // Assert
      await waitFor(() => {
        expect(habitatsService.getDashboardData).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Navigation", () => {
    beforeEach(() => {
      vi.mocked(habitatsService.getDashboardData).mockResolvedValue(
        mockDashboardData
      );
    });

    it("should navigate to discussion room when discussion is clicked", async () => {
      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText("Test Discussion")).toBeInTheDocument();
      });

      // Click discussion
      fireEvent.click(screen.getByText("Test Discussion"));

      // Assert
      expect(mockRouter.push).toHaveBeenCalledWith(
        "/habitats/habitat-1/discussions/discussion-1"
      );
    });
  });

  describe("Edge Cases", () => {
    it("should not fetch data when habitatId is missing", () => {
      // Act
      render(<HabitatDashboard habitatId="" userId="user-1" />);

      // Assert
      expect(habitatsService.getDashboardData).not.toHaveBeenCalled();
    });

    it("should not fetch data when userId is missing", () => {
      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="" />);

      // Assert
      expect(habitatsService.getDashboardData).not.toHaveBeenCalled();
    });

    it("should apply custom className", () => {
      // Act
      const { container } = render(
        <HabitatDashboard
          habitatId="habitat-1"
          userId="user-1"
          className="custom-class"
        />
      );

      // Assert
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});
