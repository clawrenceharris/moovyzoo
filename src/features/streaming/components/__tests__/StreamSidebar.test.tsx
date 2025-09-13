import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StreamSidebar } from "../StreamSidebar";
import * as streamChatHooks from "../../hooks/use-stream-chat";
import * as streamPresenceHooks from "../../hooks/use-stream-presence";

// Mock the hooks
vi.mock("../../hooks/use-stream-chat");
vi.mock("../../hooks/use-stream-presence");

const mockUseStreamMessages = vi.mocked(streamChatHooks.useStreamMessages);
const mockUseSendMessage = vi.mocked(streamChatHooks.useSendMessage);
const mockUseStreamPresence = vi.mocked(streamPresenceHooks.useStreamPresence);

// Mock components
vi.mock("@/components/states", () => ({
  LoadingState: ({ variant }: { variant: string }) => (
    <div data-testid={`loading-${variant}`}>Loading...</div>
  ),
  ErrorState: ({
    variant,
    title,
    message,
    onRetry,
  }: {
    variant: string;
    title: string;
    message: string;
    onRetry: () => void;
  }) => (
    <div data-testid={`error-${variant}`}>
      <h3>{title}</h3>
      <p>{message}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("StreamSidebar", () => {
  const defaultProps = {
    streamId: "stream-1",
    participants: [
      {
        stream_id: "stream-1",
        user_id: "user-1",
        joined_at: "2024-01-01T10:00:00Z",
        is_host: true,
        reminder_enabled: false,
        profile: {
          display_name: "Host User",
          avatar_url: "host.jpg",
        },
      },
      {
        stream_id: "stream-1",
        user_id: "user-2",
        joined_at: "2024-01-01T10:01:00Z",
        is_host: false,
        reminder_enabled: false,
        profile: {
          display_name: "Regular User",
        },
      },
    ],
    currentUserId: "user-1",
    isHost: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseStreamMessages.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    mockUseSendMessage.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as any);

    mockUseStreamPresence.mockReturnValue({
      activeParticipants: defaultProps.participants,
      totalActiveCount: 2,
    });
  });

  it("should render with participants tab active by default", () => {
    // Act
    render(<StreamSidebar {...defaultProps} />, { wrapper: createWrapper() });

    // Assert
    expect(
      screen.getByRole("tab", { name: /participants/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /chat/i })).toBeInTheDocument();
    expect(screen.getByText(/Active.*2/)).toBeInTheDocument();

    // Participants tab should be active
    const participantsTab = screen.getByRole("tab", { name: /participants/i });
    expect(participantsTab).toHaveAttribute("aria-selected", "true");
  });

  it("should switch to chat tab when clicked", () => {
    // Act
    render(<StreamSidebar {...defaultProps} />, { wrapper: createWrapper() });

    const chatTab = screen.getByRole("tab", { name: /chat/i });
    fireEvent.click(chatTab);

    // Assert
    expect(chatTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("No messages yet")).toBeInTheDocument();
  });

  it("should show chat messages when chat tab is active", () => {
    // Arrange
    const mockMessages = [
      {
        id: "msg-1",
        stream_id: "stream-1",
        user_id: "user-2",
        message: "Hello everyone!",
        created_at: "2024-01-01T10:00:00Z",
        profile: {
          display_name: "Regular User",
        },
      },
    ];

    mockUseStreamMessages.mockReturnValue({
      data: mockMessages,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    // Act
    render(<StreamSidebar {...defaultProps} />, { wrapper: createWrapper() });

    const chatTab = screen.getByRole("tab", { name: /chat/i });
    fireEvent.click(chatTab);

    // Assert
    expect(screen.getByText("Hello everyone!")).toBeInTheDocument();
    // Check for the message content specifically in the chat area
    const chatPanel = screen.getByRole("tabpanel", { name: /chat/i });
    const regularUserElements = screen.getAllByText("Regular User");
    expect(regularUserElements.length).toBeGreaterThan(0);
  });

  it("should show participant count in tab label", () => {
    // Act
    render(<StreamSidebar {...defaultProps} />, { wrapper: createWrapper() });

    // Assert
    const participantsTab = screen.getByRole("tab", { name: /participants/i });
    expect(participantsTab).toBeInTheDocument();
    expect(participantsTab).toHaveTextContent("2"); // Count badge
  });

  it("should show message count in chat tab when there are unread messages", () => {
    // Arrange
    const mockMessages = [
      {
        id: "msg-1",
        stream_id: "stream-1",
        user_id: "user-2",
        message: "Hello!",
        created_at: "2024-01-01T10:00:00Z",
        profile: { display_name: "User" },
      },
      {
        id: "msg-2",
        stream_id: "stream-1",
        user_id: "user-2",
        message: "How's everyone?",
        created_at: "2024-01-01T10:01:00Z",
        profile: { display_name: "User" },
      },
    ];

    mockUseStreamMessages.mockReturnValue({
      data: mockMessages,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    // Act
    render(<StreamSidebar {...defaultProps} />, { wrapper: createWrapper() });

    // Assert
    const chatTab = screen.getByRole("tab", { name: /chat/i });
    expect(chatTab).toBeInTheDocument();
    expect(chatTab).toHaveTextContent("2"); // Message count badge
  });

  it("should handle empty participants list", () => {
    // Arrange
    mockUseStreamPresence.mockReturnValue({
      activeParticipants: [],
      totalActiveCount: 0,
    });

    // Act
    render(<StreamSidebar {...defaultProps} participants={[]} />, {
      wrapper: createWrapper(),
    });

    // Assert
    expect(screen.getByText("No active participants")).toBeInTheDocument();
  });

  it("should maintain tab state when switching between tabs", () => {
    // Act
    render(<StreamSidebar {...defaultProps} />, { wrapper: createWrapper() });

    // Switch to chat
    const chatTab = screen.getByRole("tab", { name: /chat/i });
    fireEvent.click(chatTab);
    expect(chatTab).toHaveAttribute("aria-selected", "true");

    // Switch back to participants
    const participantsTab = screen.getByRole("tab", { name: /participants/i });
    fireEvent.click(participantsTab);
    expect(participantsTab).toHaveAttribute("aria-selected", "true");
    expect(chatTab).toHaveAttribute("aria-selected", "false");
  });
});
