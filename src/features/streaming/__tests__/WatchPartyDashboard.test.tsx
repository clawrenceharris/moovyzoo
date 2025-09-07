import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StreamDashboard } from "../components";
import type { StreamDashboardData } from "../domain/stream.types";

// Mock Supabase client
vi.mock("@/utils/supabase/client", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
  })),
}));

// Mock the hooks
vi.mock("../hooks/use-stream", () => ({
  useStreamDashboard: vi.fn(),
  useJoinStream: vi.fn(),
  useLeaveStream: vi.fn(),
}));

// Mock components
vi.mock("@/components/states", () => ({
  LoadingState: ({ variant, count }: { variant: string; count: number }) => (
    <div data-testid="loading-state" data-variant={variant} data-count={count}>
      Loading...
    </div>
  ),
  ErrorState: ({
    title,
    message,
    onRetry,
    variant,
  }: {
    title: string;
    message: string;
    onRetry?: () => void;
    variant: string;
  }) => (
    <div data-testid="error-state" data-variant={variant}>
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} data-testid="retry-button">
          Retry
        </button>
      )}
    </div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    className?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="button"
      data-variant={variant}
      className={className}
    >
      {children}
    </button>
  ),
}));

const { useStreamDashboard, useJoinStream, useLeaveStream } = await import(
  "../hooks/use-stream"
);

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("StreamDashboard", () => {
  const mockJoinMutation = {
    mutate: vi.fn(),
    isPending: false,
  };

  const mockLeaveMutation = {
    mutate: vi.fn(),
    isPending: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useJoinStream).mockReturnValue(mockJoinMutation as any);
    vi.mocked(useLeaveStream).mockReturnValue(mockLeaveMutation as any);
  });

  it("should show loading state initially", () => {
    vi.mocked(useStreamDashboard).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(
      <TestWrapper>
        <StreamDashboard streamId="test-id" userId="user-1" />
      </TestWrapper>
    );

    expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    expect(screen.getByTestId("loading-state")).toHaveAttribute(
      "data-variant",
      "card"
    );
  });

  it("should show error state when data fails to load", () => {
    const mockRefetch = vi.fn();
    vi.mocked(useStreamDashboard).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to load"),
      refetch: mockRefetch,
    } as any);

    render(
      <TestWrapper>
        <StreamDashboard streamId="test-id" userId="user-1" />
      </TestWrapper>
    );

    expect(screen.getByTestId("error-state")).toBeInTheDocument();
    expect(
      screen.getByText("Failed to load streaming session")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "We couldn't load this streaming session. Please try again."
      )
    ).toBeInTheDocument();
  });

  it("should display streaming session data when loaded successfully", () => {
    const mockDashboardData: StreamDashboardData = {
      stream: {
        id: "test-id",
        habitat_id: "habitat-1",
        media_title: "Test Movie",
        scheduled_time: "2024-12-01T20:00:00Z",
        participant_count: 3,
        max_participants: 10,
        description: "Join us for a great movie!",
        created_by: "user-1",
        created_at: "2024-11-01T10:00:00Z",
        is_active: true,
        media_type: "movie",
        release_date: "2023-01-01",
        runtime: 120,
        participants: [],
        is_participant: false,
      },
      participants: [
        {
          stream_id: "test-id",
          user_id: "user-1",
          joined_at: "2024-11-01T10:00:00Z",
          is_active: true,
        },
      ],
      userParticipation: {
        isParticipant: false,
        canJoin: true,
        canLeave: false,
      },
      canJoin: true,
      canLeave: false,
    };

    vi.mocked(useStreamDashboard).mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(
      <TestWrapper>
        <StreamDashboard streamId="test-id" userId="user-2" />
      </TestWrapper>
    );

    expect(screen.getByText("Test Movie")).toBeInTheDocument();
    expect(screen.getByText("Stream Details")).toBeInTheDocument();
    expect(screen.getByText("What We're Watching")).toBeInTheDocument();
    expect(screen.getByText("Join us for a great movie!")).toBeInTheDocument();
    expect(screen.getByText("3/10")).toBeInTheDocument();
    expect(screen.getByText("Movie")).toBeInTheDocument();
    expect(screen.getByText("2023")).toBeInTheDocument();
    expect(screen.getByText("120 minutes")).toBeInTheDocument();
  });

  it("should show join button when user can join", () => {
    const mockDashboardData: StreamDashboardData = {
      stream: {
        id: "test-id",
        habitat_id: "habitat-1",
        scheduled_time: "2024-12-01T20:00:00Z",
        participant_count: 1,
        created_by: "user-1",
        created_at: "2024-11-01T10:00:00Z",
        is_active: true,
        participants: [],
        is_participant: false,
        max_participants: 0,
      },
      participants: [],
      userParticipation: {
        isParticipant: false,
        canJoin: true,
        canLeave: false,
      },
      canJoin: true,
      canLeave: false,
    };

    vi.mocked(useStreamDashboard).mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(
      <TestWrapper>
        <StreamDashboard streamId="test-id" userId="user-2" />
      </TestWrapper>
    );

    const joinButton = screen.getByText("Join Stream");
    expect(joinButton).toBeInTheDocument();
  });

  it("should show leave button when user is participant", () => {
    const mockDashboardData: StreamDashboardData = {
      stream: {
        id: "test-id",
        habitat_id: "habitat-1",
        scheduled_time: "2024-12-01T20:00:00Z",
        participant_count: 1,
        created_by: "user-1",
        created_at: "2024-11-01T10:00:00Z",
        is_active: true,
        participants: [],
        is_participant: true,
        max_participants: 0,
      },
      participants: [],
      userParticipation: {
        isParticipant: true,
        canJoin: false,
        canLeave: true,
        joinedAt: new Date("2024-11-01T10:00:00Z"),
      },
      canJoin: false,
      canLeave: true,
    };

    vi.mocked(useStreamDashboard).mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(
      <TestWrapper>
        <StreamDashboard streamId="test-id" userId="user-1" />
      </TestWrapper>
    );

    const leaveButton = screen.getByText("Leave Stream");
    expect(leaveButton).toBeInTheDocument();
  });

  it("should display participants list when available", () => {
    const mockDashboardData: StreamDashboardData = {
      stream: {
        id: "test-id",
        habitat_id: "habitat-1",
        scheduled_time: "2024-12-01T20:00:00Z",
        participant_count: 2,
        created_by: "user-1",
        created_at: "2024-11-01T10:00:00Z",
        is_active: true,
        participants: [],
        is_participant: false,
        max_participants: 0,
      },
      participants: [
        {
          stream_id: "test-id",
          user_id: "user-1",
          joined_at: "2024-11-01T10:00:00Z",
          is_active: true,
        },
        {
          stream_id: "test-id",
          user_id: "user-2",
          joined_at: "2024-11-01T11:00:00Z",
          is_active: true,
        },
      ],
      userParticipation: {
        isParticipant: false,
        canJoin: true,
        canLeave: false,
      },
      canJoin: true,
      canLeave: false,
    };

    vi.mocked(useStreamDashboard).mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(
      <TestWrapper>
        <StreamDashboard streamId="test-id" userId="user-3" />
      </TestWrapper>
    );

    expect(screen.getByText("Participants (2)")).toBeInTheDocument();
  });
});
