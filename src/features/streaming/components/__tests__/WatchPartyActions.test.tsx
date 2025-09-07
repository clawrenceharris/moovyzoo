import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  StreamWithParticipants,
  UserParticipationStatus,
} from "../../domain/stream.types";
import { StreamActions } from "../";

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

describe("StreamActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJoinMutate.mockClear();
    mockLeaveMutate.mockClear();
  });

  it("should render join button when user is not a participant", () => {
    renderWithQueryClient(
      <StreamActions
        stream={mockStream}
        userParticipation={mockUserParticipation}
        onJoin={vi.fn()}
        onLeave={vi.fn()}
        onShare={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /join session/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /leave session/i })
    ).not.toBeInTheDocument();
  });

  it("should render leave button when user is a participant", () => {
    const participantStatus: UserParticipationStatus = {
      isParticipant: true,
      canJoin: false,
      canLeave: true,
      joinedAt: new Date("2024-01-12T15:00:00Z"),
    };

    renderWithQueryClient(
      <StreamActions
        stream={mockStream}
        userParticipation={participantStatus}
        onJoin={vi.fn()}
        onLeave={vi.fn()}
        onShare={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /leave session/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /join session/i })
    ).not.toBeInTheDocument();
  });

  it("should render share button", () => {
    renderWithQueryClient(
      <StreamActions
        stream={mockStream}
        userParticipation={mockUserParticipation}
        onJoin={vi.fn()}
        onLeave={vi.fn()}
        onShare={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
  });

  it("should call onJoin when join button is clicked", async () => {
    const onJoin = vi.fn();

    renderWithQueryClient(
      <StreamActions
        stream={mockStream}
        userParticipation={mockUserParticipation}
        onJoin={onJoin}
        onLeave={vi.fn()}
        onShare={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /join session/i }));

    await waitFor(() => {
      expect(onJoin).toHaveBeenCalledTimes(1);
    });
  });

  it("should call onLeave when leave button is clicked", async () => {
    const onLeave = vi.fn();
    const participantStatus: UserParticipationStatus = {
      isParticipant: true,
      canJoin: false,
      canLeave: true,
      joinedAt: new Date("2024-01-12T15:00:00Z"),
    };

    renderWithQueryClient(
      <StreamActions
        stream={mockStream}
        userParticipation={participantStatus}
        onJoin={vi.fn()}
        onLeave={onLeave}
        onShare={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /leave session/i }));

    await waitFor(() => {
      expect(onLeave).toHaveBeenCalledTimes(1);
    });
  });

  it("should call onShare when share button is clicked", async () => {
    const onShare = vi.fn();

    renderWithQueryClient(
      <StreamActions
        stream={mockStream}
        userParticipation={mockUserParticipation}
        onJoin={vi.fn()}
        onLeave={vi.fn()}
        onShare={onShare}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /share/i }));

    await waitFor(() => {
      expect(onShare).toHaveBeenCalledTimes(1);
    });
  });

  it("should disable join button when user cannot join", () => {
    const cannotJoinStatus: UserParticipationStatus = {
      isParticipant: false,
      canJoin: false,
      canLeave: false,
    };

    renderWithQueryClient(
      <StreamActions
        stream={mockStream}
        userParticipation={cannotJoinStatus}
        onJoin={vi.fn()}
        onLeave={vi.fn()}
        onShare={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /join session/i })
    ).toBeDisabled();
  });

  it("should disable leave button when user cannot leave", () => {
    const cannotLeaveStatus: UserParticipationStatus = {
      isParticipant: true,
      canJoin: false,
      canLeave: false,
      joinedAt: new Date("2024-01-12T15:00:00Z"),
    };

    renderWithQueryClient(
      <StreamActions
        stream={mockStream}
        userParticipation={cannotLeaveStatus}
        onJoin={vi.fn()}
        onLeave={vi.fn()}
        onShare={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /leave session/i })
    ).toBeDisabled();
  });

  it("should show capacity message when party is full", () => {
    const fullParty: StreamWithParticipants = {
      ...mockStream,
      participant_count: 10,
      max_participants: 10,
    };

    const cannotJoinStatus: UserParticipationStatus = {
      isParticipant: false,
      canJoin: false,
      canLeave: false,
    };

    renderWithQueryClient(
      <StreamActions
        stream={fullParty}
        userParticipation={cannotJoinStatus}
        onJoin={vi.fn()}
        onLeave={vi.fn()}
        onShare={vi.fn()}
      />
    );

    expect(screen.getByText(/session is full/i)).toBeInTheDocument();
  });

  it("should show loading state on leave button when leaving", () => {
    const participantStatus: UserParticipationStatus = {
      isParticipant: true,
      canJoin: false,
      canLeave: true,
      joinedAt: new Date("2024-01-12T15:00:00Z"),
    };

    renderWithQueryClient(
      <StreamActions
        stream={mockStream}
        userParticipation={participantStatus}
        onJoin={vi.fn()}
        onLeave={vi.fn()}
        onShare={vi.fn()}
        isLeaving={true}
      />
    );

    const leaveButton = screen.getByRole("button", { name: /leaving/i });
    expect(leaveButton).toBeDisabled();
  });

  it("should handle native share API when available", async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share: mockShare });

    const onShare = vi.fn();

    renderWithQueryClient(
      <StreamActions
        stream={mockStream}
        userParticipation={mockUserParticipation}
        onJoin={vi.fn()}
        onLeave={vi.fn()}
        onShare={onShare}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /share/i }));

    await waitFor(() => {
      expect(onShare).toHaveBeenCalledTimes(1);
    });
  });
});
