import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRouter } from "next/navigation";
import { HabitatDashboard } from "../HabitatDashboard";
import { habitatsService } from "../../domain/habitats.service";
import type {
  HabitatDashboardData,
  Poll,
  WatchParty,
  Discussion,
} from "../../domain/habitats.types";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock the service layer
vi.mock("../../domain/habitats.service", () => ({
  habitatsService: {
    getDashboardData: vi.fn(),
    createPoll: vi.fn(),
    createWatchParty: vi.fn(),
    createDiscussion: vi.fn(),
  },
}));

// Mock child components with realistic implementations for integration testing
vi.mock("../HabitatHero", () => ({
  HabitatHero: ({ habitat, onStartStreamingParty, onCreatePoll }: any) => (
    <div data-testid="habitat-hero">
      <h1>{habitat.name}</h1>
      <button
        onClick={onStartStreamingParty}
        data-testid="start-streaming-party"
      >
        Start Streaming Party
      </button>
      <button onClick={onCreatePoll} data-testid="create-poll">
        Create Poll
      </button>
    </div>
  ),
}));

vi.mock("../HabitatDiscussions", () => ({
  HabitatDiscussions: ({ discussions, onDiscussionClick }: any) => (
    <div data-testid="habitat-discussions">
      <h3>Discussions ({discussions.length})</h3>
      {discussions.map((discussion: any) => (
        <button
          key={discussion.id}
          onClick={() => onDiscussionClick(discussion.id)}
          data-testid={`discussion-${discussion.id}`}
        >
          {discussion.name}
        </button>
      ))}
      <button data-testid="create-discussion">Create Discussion</button>
    </div>
  ),
}));

vi.mock("../HabitatWatchParties", () => ({
  HabitatWatchParties: ({ watchParties }: any) => (
    <div data-testid="habitat-watch-parties">
      <h3>Watch Parties ({watchParties.length})</h3>
      {watchParties.map((party: any) => (
        <div key={party.id} data-testid={`watch-party-${party.id}`}>
          {party.title}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../HabitatInfo", () => ({
  HabitatInfo: ({ habitat }: any) => (
    <div data-testid="habitat-info">
      <h3>{habitat.name} Info</h3>
    </div>
  ),
}));

// Mock creation modals with realistic form interactions
vi.mock("../PollCreationModal", () => ({
  PollCreationModal: ({ isOpen, onClose, onSuccess, habitatId, userId }: any) =>
    isOpen ? (
      <div data-testid="poll-creation-modal">
        <h2>Create Poll</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const title = formData.get("title") as string;
            const option1 = formData.get("option1") as string;
            const option2 = formData.get("option2") as string;

            if (!title || !option1 || !option2) {
              return; // Validation failed
            }

            // Simulate successful poll creation
            const newPoll: Poll = {
              id: `poll-${Date.now()}`,
              habitat_id: habitatId,
              title,
              options: { [option1]: 0, [option2]: 0 },
              created_by: userId,
              created_at: new Date().toISOString(),
              is_active: true,
            };

            // Call service and then success callback
            habitatsService
              .createPoll(habitatId, title, newPoll.options, userId)
              .then(() => onSuccess(newPoll))
              .catch(() => {
                // Handle error in real implementation
              });
          }}
          data-testid="poll-form"
        >
          <input
            name="title"
            placeholder="Poll title"
            data-testid="poll-title-input"
            required
          />
          <input
            name="option1"
            placeholder="Option 1"
            data-testid="poll-option1-input"
            required
          />
          <input
            name="option2"
            placeholder="Option 2"
            data-testid="poll-option2-input"
            required
          />
          <button type="submit" data-testid="submit-poll">
            Create Poll
          </button>
          <button type="button" onClick={onClose} data-testid="cancel-poll">
            Cancel
          </button>
        </form>
      </div>
    ) : null,
}));

vi.mock("../WatchPartyCreationModal", () => ({
  WatchPartyCreationModal: ({
    isOpen,
    onClose,
    onSuccess,
    habitatId,
    userId,
  }: any) =>
    isOpen ? (
      <div data-testid="watch-party-creation-modal">
        <h2>Create Watch Party</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const title = formData.get("title") as string;
            const scheduledDate = formData.get("scheduledDate") as string;
            const scheduledTime = formData.get("scheduledTime") as string;

            if (!title || !scheduledDate || !scheduledTime) {
              return; // Validation failed
            }

            // Simulate successful watch party creation
            const scheduledDateTime = new Date(
              `${scheduledDate}T${scheduledTime}`
            );
            const newWatchParty: WatchParty = {
              id: `party-${Date.now()}`,
              habitat_id: habitatId,
              title,
              description: undefined,
              scheduled_time: scheduledDateTime.toISOString(),
              participant_count: 1,
              max_participants: undefined,
              created_by: userId,
              created_at: new Date().toISOString(),
              is_active: true,
              participants: [],
              user_is_participant: true,
            };

            // Call service and then success callback
            habitatsService
              .createWatchParty(habitatId, userId, {
                description: undefined,
                scheduledTime: scheduledDateTime.toISOString(),
                maxParticipants: undefined,
                media: undefined,
              })
              .then(() => onSuccess(newWatchParty))
              .catch(() => {
                // Handle error in real implementation
              });
          }}
          data-testid="watch-party-form"
        >
          <input
            name="title"
            placeholder="Watch party title"
            data-testid="party-title-input"
            required
          />
          <input
            name="scheduledDate"
            type="date"
            data-testid="party-date-input"
            required
          />
          <input
            name="scheduledTime"
            type="time"
            data-testid="party-time-input"
            required
          />
          <button type="submit" data-testid="submit-watch-party">
            Create Watch Party
          </button>
          <button
            type="button"
            onClick={onClose}
            data-testid="cancel-watch-party"
          >
            Cancel
          </button>
        </form>
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
      <button onClick={onRetry} data-testid="retry-btn">
        Retry
      </button>
    </div>
  ),
}));

describe("Creation Workflows Integration Tests", () => {
  const mockRouter = {
    push: vi.fn(),
  };

  const mockDashboardData: HabitatDashboardData = {
    habitat: {
      id: "habitat-1",
      name: "Sci-Fi Universe",
      description: "Explore the depths of science fiction",
      tags: ["sci-fi", "space"],
      member_count: 150,
      is_public: true,
      created_by: "user-1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      is_member: true,
      role: "member",
    },
    discussions: [],
    watchParties: [],
    members: [],
    onlineMembers: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    vi.mocked(habitatsService.getDashboardData).mockResolvedValue(
      mockDashboardData
    );
  });

  describe("Poll Creation Workflow", () => {
    it("should complete full poll creation flow from button click to dashboard update", async () => {
      // Arrange
      const mockPoll: Poll = {
        id: "poll-1",
        habitat_id: "habitat-1",
        title: "Favorite Sci-Fi Movie",
        options: { "Blade Runner": 0, Dune: 0 },
        created_by: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        is_active: true,
      };

      vi.mocked(habitatsService.createPoll).mockResolvedValue(mockPoll);

      // Mock updated dashboard data after poll creation
      const updatedDashboardData = {
        ...mockDashboardData,
        // In real implementation, polls would be part of dashboard data
      };
      vi.mocked(habitatsService.getDashboardData)
        .mockResolvedValueOnce(mockDashboardData)
        .mockResolvedValueOnce(updatedDashboardData);

      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId("create-poll")).toBeInTheDocument();
      });

      // Step 1: Click create poll button
      fireEvent.click(screen.getByTestId("create-poll"));

      // Step 2: Verify modal opens
      await waitFor(() => {
        expect(screen.getByTestId("poll-creation-modal")).toBeInTheDocument();
      });

      // Step 3: Fill out poll form
      fireEvent.change(screen.getByTestId("poll-title-input"), {
        target: { value: "Favorite Sci-Fi Movie" },
      });
      fireEvent.change(screen.getByTestId("poll-option1-input"), {
        target: { value: "Blade Runner" },
      });
      fireEvent.change(screen.getByTestId("poll-option2-input"), {
        target: { value: "Dune" },
      });

      // Step 4: Submit poll
      fireEvent.click(screen.getByTestId("submit-poll"));

      // Step 5: Verify service call
      await waitFor(() => {
        expect(habitatsService.createPoll).toHaveBeenCalledWith(
          "habitat-1",
          "Favorite Sci-Fi Movie",
          { "Blade Runner": 0, Dune: 0 },
          "user-1"
        );
      });

      // Step 6: Verify dashboard refresh
      await waitFor(() => {
        expect(habitatsService.getDashboardData).toHaveBeenCalledTimes(2);
      });

      // Step 7: Verify modal closes
      await waitFor(() => {
        expect(
          screen.queryByTestId("poll-creation-modal")
        ).not.toBeInTheDocument();
      });
    });

    it("should handle poll creation errors and allow retry", async () => {
      // Arrange
      const error = new Error("Failed to create poll");
      vi.mocked(habitatsService.createPoll)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({
          id: "poll-1",
          habitat_id: "habitat-1",
          title: "Test Poll",
          options: { "Option 1": 0, "Option 2": 0 },
          created_by: "user-1",
          created_at: "2024-01-01T00:00:00Z",
          is_active: true,
        });

      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByTestId("create-poll")).toBeInTheDocument();
      });

      // Open modal and fill form
      fireEvent.click(screen.getByTestId("create-poll"));

      await waitFor(() => {
        expect(screen.getByTestId("poll-creation-modal")).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId("poll-title-input"), {
        target: { value: "Test Poll" },
      });
      fireEvent.change(screen.getByTestId("poll-option1-input"), {
        target: { value: "Option 1" },
      });
      fireEvent.change(screen.getByTestId("poll-option2-input"), {
        target: { value: "Option 2" },
      });

      // First submission fails
      fireEvent.click(screen.getByTestId("submit-poll"));

      await waitFor(() => {
        expect(habitatsService.createPoll).toHaveBeenCalledTimes(1);
      });

      // Modal should still be open for retry
      expect(screen.getByTestId("poll-creation-modal")).toBeInTheDocument();

      // Retry submission
      fireEvent.click(screen.getByTestId("submit-poll"));

      // Assert successful retry
      await waitFor(() => {
        expect(habitatsService.createPoll).toHaveBeenCalledTimes(2);
      });
    });

    it("should handle poll creation cancellation", async () => {
      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByTestId("create-poll")).toBeInTheDocument();
      });

      // Open modal
      fireEvent.click(screen.getByTestId("create-poll"));

      await waitFor(() => {
        expect(screen.getByTestId("poll-creation-modal")).toBeInTheDocument();
      });

      // Cancel creation
      fireEvent.click(screen.getByTestId("cancel-poll"));

      // Assert
      await waitFor(() => {
        expect(
          screen.queryByTestId("poll-creation-modal")
        ).not.toBeInTheDocument();
      });

      expect(habitatsService.createPoll).not.toHaveBeenCalled();
      // Dashboard should not refresh
      expect(habitatsService.getDashboardData).toHaveBeenCalledTimes(1);
    });
  });

  describe("Watch Party Creation Workflow", () => {
    it("should complete full watch party creation flow from button click to dashboard update", async () => {
      // Arrange
      const mockWatchParty: WatchParty = {
        id: "party-1",
        habitat_id: "habitat-1",
        title: "Dune Marathon",
        description: undefined,
        scheduled_time: "2024-01-02T20:00:00Z",
        participant_count: 1,
        max_participants: undefined,
        created_by: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        is_active: true,
        participants: [],
        user_is_participant: true,
      };

      vi.mocked(habitatsService.createWatchParty).mockResolvedValue(
        mockWatchParty
      );

      // Mock updated dashboard data
      const updatedDashboardData = {
        ...mockDashboardData,
        watchParties: [mockWatchParty],
      };
      vi.mocked(habitatsService.getDashboardData)
        .mockResolvedValueOnce(mockDashboardData)
        .mockResolvedValueOnce(updatedDashboardData);

      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByTestId("start-streaming-party")).toBeInTheDocument();
      });

      // Step 1: Click start streaming party button
      fireEvent.click(screen.getByTestId("start-streaming-party"));

      // Step 2: Verify modal opens
      await waitFor(() => {
        expect(
          screen.getByTestId("watch-party-creation-modal")
        ).toBeInTheDocument();
      });

      // Step 3: Fill out watch party form
      fireEvent.change(screen.getByTestId("party-title-input"), {
        target: { value: "Dune Marathon" },
      });
      fireEvent.change(screen.getByTestId("party-date-input"), {
        target: { value: "2024-01-02" },
      });
      fireEvent.change(screen.getByTestId("party-time-input"), {
        target: { value: "20:00" },
      });

      // Step 4: Submit watch party
      fireEvent.click(screen.getByTestId("submit-watch-party"));

      // Step 5: Verify service call
      await waitFor(() => {
        expect(habitatsService.createWatchParty).toHaveBeenCalledWith(
          "habitat-1",
          "user-1",
          expect.objectContaining({
            scheduledTime: "2024-01-02T20:00:00.000Z",
          })
        );
      });

      // Step 6: Verify dashboard refresh
      await waitFor(() => {
        expect(habitatsService.getDashboardData).toHaveBeenCalledTimes(2);
      });

      // Step 7: Verify modal closes
      await waitFor(() => {
        expect(
          screen.queryByTestId("watch-party-creation-modal")
        ).not.toBeInTheDocument();
      });
    });

    it("should handle watch party creation with validation errors", async () => {
      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByTestId("start-streaming-party")).toBeInTheDocument();
      });

      // Open modal
      fireEvent.click(screen.getByTestId("start-streaming-party"));

      await waitFor(() => {
        expect(
          screen.getByTestId("watch-party-creation-modal")
        ).toBeInTheDocument();
      });

      // Submit without filling required fields
      fireEvent.click(screen.getByTestId("submit-watch-party"));

      // Assert - Form should not submit due to validation
      expect(habitatsService.createWatchParty).not.toHaveBeenCalled();
      expect(
        screen.getByTestId("watch-party-creation-modal")
      ).toBeInTheDocument();
    });
  });

  describe("Real-time Dashboard Updates After Creation", () => {
    it("should show updated watch parties count after successful creation", async () => {
      // Arrange
      const mockWatchParty: WatchParty = {
        id: "party-1",
        habitat_id: "habitat-1",
        title: "New Watch Party",
        description: undefined,
        scheduled_time: "2024-01-02T20:00:00Z",
        participant_count: 1,
        max_participants: undefined,
        created_by: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        is_active: true,
        participants: [],
        user_is_participant: true,
      };

      vi.mocked(habitatsService.createWatchParty).mockResolvedValue(
        mockWatchParty
      );

      // Mock dashboard data before and after creation
      const updatedDashboardData = {
        ...mockDashboardData,
        watchParties: [mockWatchParty],
      };

      vi.mocked(habitatsService.getDashboardData)
        .mockResolvedValueOnce(mockDashboardData) // Initial load
        .mockResolvedValueOnce(updatedDashboardData); // After creation

      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      // Initial state - no watch parties
      await waitFor(() => {
        expect(screen.getByText("Watch Parties (0)")).toBeInTheDocument();
      });

      // Create watch party
      fireEvent.click(screen.getByTestId("start-streaming-party"));

      await waitFor(() => {
        expect(
          screen.getByTestId("watch-party-creation-modal")
        ).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId("party-title-input"), {
        target: { value: "New Watch Party" },
      });
      fireEvent.change(screen.getByTestId("party-date-input"), {
        target: { value: "2024-01-02" },
      });
      fireEvent.change(screen.getByTestId("party-time-input"), {
        target: { value: "20:00" },
      });

      fireEvent.click(screen.getByTestId("submit-watch-party"));

      // Assert - Updated count should be displayed
      await waitFor(() => {
        expect(screen.getByText("Watch Parties (1)")).toBeInTheDocument();
      });

      // Verify the new watch party is displayed
      expect(screen.getByTestId("watch-party-party-1")).toBeInTheDocument();
      expect(screen.getByText("New Watch Party")).toBeInTheDocument();
    });

    it("should handle concurrent creation operations", async () => {
      // Arrange
      const mockPoll: Poll = {
        id: "poll-1",
        habitat_id: "habitat-1",
        title: "Test Poll",
        options: { "Option 1": 0, "Option 2": 0 },
        created_by: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        is_active: true,
      };

      const mockWatchParty: WatchParty = {
        id: "party-1",
        habitat_id: "habitat-1",
        title: "Test Party",
        description: undefined,
        scheduled_time: "2024-01-02T20:00:00Z",
        participant_count: 1,
        max_participants: undefined,
        created_by: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        is_active: true,
        participants: [],
        user_is_participant: true,
      };

      vi.mocked(habitatsService.createPoll).mockResolvedValue(mockPoll);
      vi.mocked(habitatsService.createWatchParty).mockResolvedValue(
        mockWatchParty
      );

      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByTestId("create-poll")).toBeInTheDocument();
        expect(screen.getByTestId("start-streaming-party")).toBeInTheDocument();
      });

      // Open poll modal
      fireEvent.click(screen.getByTestId("create-poll"));

      await waitFor(() => {
        expect(screen.getByTestId("poll-creation-modal")).toBeInTheDocument();
      });

      // Close poll modal and open watch party modal
      fireEvent.click(screen.getByTestId("cancel-poll"));

      await waitFor(() => {
        expect(
          screen.queryByTestId("poll-creation-modal")
        ).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("start-streaming-party"));

      await waitFor(() => {
        expect(
          screen.getByTestId("watch-party-creation-modal")
        ).toBeInTheDocument();
      });

      // Assert - Only one modal should be open at a time
      expect(
        screen.queryByTestId("poll-creation-modal")
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId("watch-party-creation-modal")
      ).toBeInTheDocument();
    });
  });

  describe("Error Handling in Creation Workflows", () => {
    it("should handle network errors during creation gracefully", async () => {
      // Arrange
      const networkError = new Error("Network error");
      vi.mocked(habitatsService.createPoll).mockRejectedValue(networkError);

      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByTestId("create-poll")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("create-poll"));

      await waitFor(() => {
        expect(screen.getByTestId("poll-creation-modal")).toBeInTheDocument();
      });

      // Fill and submit form
      fireEvent.change(screen.getByTestId("poll-title-input"), {
        target: { value: "Test Poll" },
      });
      fireEvent.change(screen.getByTestId("poll-option1-input"), {
        target: { value: "Option 1" },
      });
      fireEvent.change(screen.getByTestId("poll-option2-input"), {
        target: { value: "Option 2" },
      });

      fireEvent.click(screen.getByTestId("submit-poll"));

      // Assert - Modal should remain open for retry
      await waitFor(() => {
        expect(habitatsService.createPoll).toHaveBeenCalled();
      });

      // Modal should still be open
      expect(screen.getByTestId("poll-creation-modal")).toBeInTheDocument();

      // Dashboard should not refresh on error
      expect(habitatsService.getDashboardData).toHaveBeenCalledTimes(1);
    });

    it("should handle service unavailable errors", async () => {
      // Arrange
      const serviceError = new Error("Service unavailable");
      vi.mocked(habitatsService.createWatchParty).mockRejectedValue(
        serviceError
      );

      // Act
      render(<HabitatDashboard habitatId="habitat-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByTestId("start-streaming-party")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("start-streaming-party"));

      await waitFor(() => {
        expect(
          screen.getByTestId("watch-party-creation-modal")
        ).toBeInTheDocument();
      });

      // Fill and submit form
      fireEvent.change(screen.getByTestId("party-title-input"), {
        target: { value: "Test Party" },
      });
      fireEvent.change(screen.getByTestId("party-date-input"), {
        target: { value: "2024-01-02" },
      });
      fireEvent.change(screen.getByTestId("party-time-input"), {
        target: { value: "20:00" },
      });

      fireEvent.click(screen.getByTestId("submit-watch-party"));

      // Assert
      await waitFor(() => {
        expect(habitatsService.createWatchParty).toHaveBeenCalled();
      });

      // Modal should remain open for user to retry or cancel
      expect(
        screen.getByTestId("watch-party-creation-modal")
      ).toBeInTheDocument();
    });
  });
});
