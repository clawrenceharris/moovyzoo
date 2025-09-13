import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StreamChat } from "../StreamChat";
import * as streamChatHooks from "../../hooks/use-stream-chat";

// Mock the hooks
vi.mock("../../hooks/use-stream-chat");

const mockUseStreamMessages = vi.mocked(streamChatHooks.useStreamMessages);
const mockUseSendMessage = vi.mocked(streamChatHooks.useSendMessage);

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

describe("StreamChat", () => {
  const defaultProps = {
    streamId: "stream-1",
    currentUserId: "user-1",
  };

  const mockMessages = [
    {
      id: "msg-1",
      stream_id: "stream-1",
      user_id: "user-2",
      message: "Hello everyone!",
      created_at: "2024-01-01T10:00:00Z",
      profile: {
        display_name: "Alice",
        avatar_url: "alice.jpg",
      },
    },
    {
      id: "msg-2",
      stream_id: "stream-1",
      user_id: "user-1",
      message: "Hi there!",
      created_at: "2024-01-01T10:01:00Z",
      profile: {
        display_name: "You",
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state", () => {
    // Arrange
    mockUseStreamMessages.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any);

    mockUseSendMessage.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as any);

    // Act
    render(<StreamChat {...defaultProps} />, { wrapper: createWrapper() });

    // Assert
    expect(screen.getByTestId("loading-inline")).toBeInTheDocument();
    expect(screen.getByText("Chat")).toBeInTheDocument();
  });

  it("should render error state", () => {
    // Arrange
    const mockRefetch = vi.fn();
    mockUseStreamMessages.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error("Failed to load"),
      refetch: mockRefetch,
    } as any);

    mockUseSendMessage.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as any);

    // Act
    render(<StreamChat {...defaultProps} />, { wrapper: createWrapper() });

    // Assert
    expect(screen.getByTestId("error-inline")).toBeInTheDocument();
    expect(screen.getByText("Failed to load chat")).toBeInTheDocument();
    expect(
      screen.getByText("Unable to load messages. Please try again.")
    ).toBeInTheDocument();

    // Test retry functionality
    fireEvent.click(screen.getByText("Retry"));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("should render empty state when no messages", () => {
    // Arrange
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

    // Act
    render(<StreamChat {...defaultProps} />, { wrapper: createWrapper() });

    // Assert
    expect(screen.getByText("No messages yet")).toBeInTheDocument();
    expect(screen.getByText("Start the conversation!")).toBeInTheDocument();
  });

  it("should render messages correctly", () => {
    // Arrange
    mockUseStreamMessages.mockReturnValue({
      data: mockMessages,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    mockUseSendMessage.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as any);

    // Act
    render(<StreamChat {...defaultProps} />, { wrapper: createWrapper() });

    // Assert
    expect(screen.getByText("Hello everyone!")).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("should send message when form is submitted", async () => {
    // Arrange
    const mockMutateAsync = vi.fn().mockResolvedValue({});
    mockUseStreamMessages.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    mockUseSendMessage.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
    } as any);

    // Act
    render(<StreamChat {...defaultProps} />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText("Type a message...");
    const sendButton = screen.getByRole("button", { name: /send message/i });

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.click(sendButton);

    // Assert
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        stream_id: "stream-1",
        user_id: "user-1",
        message: "Test message",
      });
    });
  });

  it("should not send empty messages", async () => {
    // Arrange
    const mockMutateAsync = vi.fn();
    mockUseStreamMessages.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    mockUseSendMessage.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
    } as any);

    // Act
    render(<StreamChat {...defaultProps} />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText("Type a message...");
    const sendButton = screen.getByRole("button", { name: /send message/i });

    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(sendButton);

    // Assert
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("should disable input and show loading when sending", () => {
    // Arrange
    mockUseStreamMessages.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    mockUseSendMessage.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
      error: null,
    } as any);

    // Act
    render(<StreamChat {...defaultProps} />, { wrapper: createWrapper() });

    // Assert
    const input = screen.getByPlaceholderText("Type a message...");
    const sendButton = screen.getByRole("button", { name: /send message/i });

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it("should show error message when send fails", () => {
    // Arrange
    mockUseStreamMessages.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    mockUseSendMessage.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: new Error("Send failed"),
    } as any);

    // Act
    render(<StreamChat {...defaultProps} />, { wrapper: createWrapper() });

    // Assert
    expect(
      screen.getByText("Failed to send message. Please try again.")
    ).toBeInTheDocument();
  });
});
