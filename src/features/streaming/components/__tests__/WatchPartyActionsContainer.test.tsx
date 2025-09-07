import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  StreamWithParticipants,
  UserParticipationStatus,
} from "../../domain/stream.types";
import { StreamActionsContainer } from "../";

// Mock the hooks
const mockJoinMutate = vi.fn();
const mockLeaveMutate = vi.fn();

vi.mock("../../hooks/use-streaming-mutations", () => ({
  useJoinStream: () => ({
    mutate: mockJoinMutate,
    isPending: false,
    error: null,
  }),
  useLeaveStream: () => ({
    mutate: mockLeaveMutate,
    isPending: false,
    error: null,
  }),
}));

// Mock Web Share API
Object.assign(navigator, {
  share: vi.fn(),
});

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const mockStream: StreamWithParticipants = {
  id: "1",
  habitat_id: "habitat-1",
  description: "Let's watch a great movie together!",
  scheduled_time: "2024-01-15T20:00:00Z",
  participant_count: 3,
  max_participants: 10,
  created_by: "user-1",
  created_at: "2024-01-10T10:00:00Z",
  is_active: true,
  tmdb_id: 123,
  media_type: "movie",
  media_title: "The Great Movie",
  poster_path: "/poster.jpg",
  participants: [],
  is_participant: false,
};

const mockUserParticipation: UserParticipationStatus = {
  isParticipant: false,
  canJoin: true,
  canLeave: false,
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe("StreamActionsContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJoinMutate.mockClear();
    mockLeaveMutate.mockClear();
  });

  it("should call join mutation when join button is clicked", async () => {
    renderWithQueryClient(
      <StreamActionsContainer
        stream={mockStream}
        userParticipation={mockUserParticipation}
        userId="user-123"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /join session/i }));

    await waitFor(() => {
      expect(mockJoinMutate).toHaveBeenCalledWith({
        streamId: "1",
        userId: "user-123",
      });
    });
  });

  it("should call leave mutation when leave button is clicked", async () => {
    const participantStatus: UserParticipationStatus = {
      isParticipant: true,
      canJoin: false,
      canLeave: true,
      joinedAt: new Date("2024-01-12T15:00:00Z"),
    };

    renderWithQueryClient(
      <StreamActionsContainer
        stream={mockStream}
        userParticipation={participantStatus}
        userId="user-123"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /leave session/i }));

    await waitFor(() => {
      expect(mockLeaveMutate).toHaveBeenCalledWith({
        streamId: "1",
        userId: "user-123",
      });
    });
  });

  it("should handle share functionality with native Web Share API", async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share: mockShare });

    renderWithQueryClient(
      <StreamActionsContainer
        stream={mockStream}
        userParticipation={mockUserParticipation}
        userId="user-123"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /share/i }));

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: "Movie Night - The Great Movie",
        text: "Join me for a streaming session!",
        url: expect.stringContaining("/streams/1"),
      });
    });
  });

  it("should fallback to clipboard when Web Share API is not available", async () => {
    // Mock clipboard API
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      share: undefined,
      clipboard: { writeText: mockWriteText },
    });

    renderWithQueryClient(
      <StreamActionsContainer
        stream={mockStream}
        userParticipation={mockUserParticipation}
        userId="user-123"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /share/i }));

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        expect.stringContaining("/streams/1")
      );
    });
  });

  it("should handle share errors gracefully", async () => {
    const mockShare = vi.fn().mockRejectedValue(new Error("Share failed"));
    Object.assign(navigator, { share: mockShare });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderWithQueryClient(
      <StreamActionsContainer
        stream={mockStream}
        userParticipation={mockUserParticipation}
        userId="user-123"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /share/i }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error sharing:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it("should include media title in share data when available", async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share: mockShare });

    renderWithQueryClient(
      <StreamActionsContainer
        stream={mockStream}
        userParticipation={mockUserParticipation}
        userId="user-123"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /share/i }));

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: "Movie Night - The Great Movie",
        text: "Join me for a streaming session!",
        url: expect.stringContaining("/streams/1"),
      });
    });
  });
});
