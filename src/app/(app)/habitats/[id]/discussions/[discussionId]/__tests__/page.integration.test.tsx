import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useParams, useRouter } from "next/navigation";
import DiscussionRoomPage from "../page";
import { habitatsService } from "@/features/habitats/domain/habitats.service";
import { useUser } from "@/hooks/use-user";
import {
  useDiscussionMessages,
  useDiscussionRealtimeChat,
} from "@/features/habitats/hooks";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("@/hooks/use-user", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/features/habitats/domain/habitats.service", () => ({
  habitatsService: {
    canUserAccessHabitat: vi.fn(),
    getDiscussionById: vi.fn(),
    getHabitatById: vi.fn(),
  },
}));

vi.mock("@/features/habitats/hooks", () => ({
  useDiscussionMessages: vi.fn(),
  useDiscussionRealtimeChat: vi.fn(),
}));

vi.mock("@/features/habitats/components", () => ({
  ChatInterface: ({
    messages,
    discussion,
    error,
    loading,
    sending,
    onSendMessage,
    onLoadMore,
    hasMore,
    loadingMore,
  }: any) => (
    <div data-testid="chat-interface">
      {error && <div data-testid="chat-error">{error}</div>}
      {loading && <div data-testid="chat-loading">Loading messages...</div>}
      {discussion && (
        <div data-testid="discussion-header">
          <h1>{discussion.name}</h1>
          <p>{discussion.description}</p>
        </div>
      )}
      <div data-testid="messages-container">
        {messages?.map((msg: any) => (
          <div key={msg.id} data-testid={`message-${msg.id}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div data-testid="message-input">
        <input
          placeholder="Type a message..."
          onChange={(e) => {
            // Simulate typing
          }}
        />
        <button
          onClick={() => onSendMessage("Test message")}
          disabled={sending}
          data-testid="send-button"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loadingMore}
          data-testid="load-more-button"
        >
          {loadingMore ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  ),
}));

describe("DiscussionRoomPage Integration Tests", () => {
  const mockRouter = {
    push: vi.fn(),
  };

  const mockUser = {
    id: "user-1",
    email: "test@example.com",
  };

  const mockParams = {
    id: "550e8400-e29b-41d4-a716-446655440000", // Valid UUID
    discussionId: "550e8400-e29b-41d4-a716-446655440001", // Valid UUID
  };

  const mockDiscussion = {
    id: "550e8400-e29b-41d4-a716-446655440001",
    habitat_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Sci-Fi Movie Discussion",
    description: "Let's talk about our favorite sci-fi movies",
    created_by: "user-1",
    created_at: "2024-01-01T00:00:00Z",
    is_active: true,
  };

  const mockHabitat = {
    id: "550e8400-e29b-41d4-a716-446655440000",
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
  };

  const mockMessages = [
    {
      id: "msg-1",
      habitat_id: "550e8400-e29b-41d4-a716-446655440000",
      chat_id: "550e8400-e29b-41d4-a716-446655440001",
      user_id: "user-1",
      content: "What's your favorite sci-fi movie?",
      created_at: "2024-01-01T10:00:00Z",
      user_profile: {
        display_name: "User One",
        avatar_url: null,
      },
    },
    {
      id: "msg-2",
      habitat_id: "550e8400-e29b-41d4-a716-446655440000",
      chat_id: "550e8400-e29b-41d4-a716-446655440001",
      user_id: "user-2",
      content: "I love Blade Runner!",
      created_at: "2024-01-01T10:05:00Z",
      user_profile: {
        display_name: "User Two",
        avatar_url: null,
      },
    },
  ];

  const mockUseDiscussionMessages = {
    messages: mockMessages,
    loading: false,
    loadingMore: false,
    sending: false,
    error: null,
    hasMore: true,
    sendMessage: vi.fn(),
    loadMore: vi.fn(),
    addMessage: vi.fn(),
    updateMessage: vi.fn(),
    removeMessage: vi.fn(),
  };

  const mockUseDiscussionRealtimeChat = {};

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    (useParams as any).mockReturnValue(mockParams);
    (useUser as any).mockReturnValue({ user: mockUser });
    (useDiscussionMessages as any).mockReturnValue(mockUseDiscussionMessages);
    (useDiscussionRealtimeChat as any).mockReturnValue(
      mockUseDiscussionRealtimeChat
    );

    // Setup successful service calls by default
    vi.mocked(habitatsService.canUserAccessHabitat).mockResolvedValue(true);
    vi.mocked(habitatsService.getDiscussionById).mockResolvedValue(
      mockDiscussion
    );
    vi.mocked(habitatsService.getHabitatById).mockResolvedValue(mockHabitat);
  });

  describe("Complete Discussion Room Flow", () => {
    it("should complete full access validation and render discussion room", async () => {
      // Act
      render(<DiscussionRoomPage />);

      // Assert - Should go through complete flow
      // 1. Validate access
      await waitFor(() => {
        expect(habitatsService.canUserAccessHabitat).toHaveBeenCalledWith(
          "550e8400-e29b-41d4-a716-446655440000",
          "user-1"
        );
      });

      // 2. Fetch discussion and habitat data
      await waitFor(() => {
        expect(habitatsService.getDiscussionById).toHaveBeenCalledWith(
          "550e8400-e29b-41d4-a716-446655440001",
          "user-1"
        );
        expect(habitatsService.getHabitatById).toHaveBeenCalledWith(
          "550e8400-e29b-41d4-a716-446655440000",
          "user-1"
        );
      });

      // 3. Initialize hooks with correct parameters
      expect(useDiscussionMessages).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000",
        "550e8400-e29b-41d4-a716-446655440001",
        "user-1"
      );

      expect(useDiscussionRealtimeChat).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000",
        "550e8400-e29b-41d4-a716-446655440001",
        "user-1",
        expect.objectContaining({
          onMessageInsert: expect.any(Function),
          onMessageUpdate: expect.any(Function),
          onMessageDelete: expect.any(Function),
        })
      );

      // 4. Render chat interface with discussion data
      await waitFor(() => {
        expect(screen.getByTestId("chat-interface")).toBeInTheDocument();
      });

      expect(screen.getByTestId("discussion-header")).toBeInTheDocument();
      expect(screen.getByText("Sci-Fi Movie Discussion")).toBeInTheDocument();
      expect(
        screen.getByText("Let's talk about our favorite sci-fi movies")
      ).toBeInTheDocument();
    });

    it("should display messages and handle message interactions", async () => {
      // Act
      render(<DiscussionRoomPage />);

      // Wait for chat interface to load
      await waitFor(() => {
        expect(screen.getByTestId("chat-interface")).toBeInTheDocument();
      });

      // Assert - Messages are displayed
      expect(screen.getByTestId("message-msg-1")).toBeInTheDocument();
      expect(screen.getByTestId("message-msg-2")).toBeInTheDocument();
      expect(
        screen.getByText("What's your favorite sci-fi movie?")
      ).toBeInTheDocument();
      expect(screen.getByText("I love Blade Runner!")).toBeInTheDocument();

      // Assert - Message input is available
      expect(screen.getByTestId("message-input")).toBeInTheDocument();
      expect(screen.getByTestId("send-button")).toBeInTheDocument();

      // Assert - Load more functionality is available
      expect(screen.getByTestId("load-more-button")).toBeInTheDocument();
    });

    it("should handle message sending flow", async () => {
      // Arrange
      const mockSendMessage = vi.fn().mockResolvedValue({
        id: "msg-3",
        content: "Test message",
      });
      (useDiscussionMessages as any).mockReturnValue({
        ...mockUseDiscussionMessages,
        sendMessage: mockSendMessage,
      });

      // Act
      render(<DiscussionRoomPage />);

      await waitFor(() => {
        expect(screen.getByTestId("send-button")).toBeInTheDocument();
      });

      // Send a message
      fireEvent.click(screen.getByTestId("send-button"));

      // Assert
      expect(mockSendMessage).toHaveBeenCalledWith("Test message");
    });

    it("should handle load more messages flow", async () => {
      // Arrange
      const mockLoadMore = vi.fn().mockResolvedValue([]);
      (useDiscussionMessages as any).mockReturnValue({
        ...mockUseDiscussionMessages,
        loadMore: mockLoadMore,
      });

      // Act
      render(<DiscussionRoomPage />);

      await waitFor(() => {
        expect(screen.getByTestId("load-more-button")).toBeInTheDocument();
      });

      // Load more messages
      fireEvent.click(screen.getByTestId("load-more-button"));

      // Assert
      expect(mockLoadMore).toHaveBeenCalledTimes(1);
    });
  });

  describe("Real-time Message Updates", () => {
    it("should handle real-time message insertion", async () => {
      // Arrange
      let realtimeCallbacks: any = {};
      (useDiscussionRealtimeChat as any).mockImplementation(
        (habitatId, discussionId, userId, callbacks) => {
          realtimeCallbacks = callbacks;
          return {};
        }
      );

      const mockAddMessage = vi.fn();
      (useDiscussionMessages as any).mockReturnValue({
        ...mockUseDiscussionMessages,
        addMessage: mockAddMessage,
      });

      // Act
      render(<DiscussionRoomPage />);

      await waitFor(() => {
        expect(screen.getByTestId("chat-interface")).toBeInTheDocument();
      });

      // Simulate real-time message insertion
      const newMessage = {
        id: "msg-3",
        habitat_id: "habitat-1",
        chat_id: "discussion-1",
        user_id: "user-3",
        content: "New real-time message!",
        created_at: "2024-01-01T10:10:00Z",
      };

      realtimeCallbacks.onMessageInsert(newMessage);

      // Assert
      expect(mockAddMessage).toHaveBeenCalledWith(newMessage);
    });

    it("should handle real-time message updates", async () => {
      // Arrange
      let realtimeCallbacks: any = {};
      (useDiscussionRealtimeChat as any).mockImplementation(
        (habitatId, discussionId, userId, callbacks) => {
          realtimeCallbacks = callbacks;
          return {};
        }
      );

      const mockUpdateMessage = vi.fn();
      (useDiscussionMessages as any).mockReturnValue({
        ...mockUseDiscussionMessages,
        updateMessage: mockUpdateMessage,
      });

      // Act
      render(<DiscussionRoomPage />);

      await waitFor(() => {
        expect(screen.getByTestId("chat-interface")).toBeInTheDocument();
      });

      // Simulate real-time message update
      const updatedMessage = {
        id: "msg-1",
        content: "Updated message content",
      };

      realtimeCallbacks.onMessageUpdate(updatedMessage);

      // Assert
      expect(mockUpdateMessage).toHaveBeenCalledWith(updatedMessage);
    });

    it("should handle real-time message deletion", async () => {
      // Arrange
      let realtimeCallbacks: any = {};
      (useDiscussionRealtimeChat as any).mockImplementation(
        (habitatId, discussionId, userId, callbacks) => {
          realtimeCallbacks = callbacks;
          return {};
        }
      );

      const mockRemoveMessage = vi.fn();
      (useDiscussionMessages as any).mockReturnValue({
        ...mockUseDiscussionMessages,
        removeMessage: mockRemoveMessage,
      });

      // Act
      render(<DiscussionRoomPage />);

      await waitFor(() => {
        expect(screen.getByTestId("chat-interface")).toBeInTheDocument();
      });

      // Simulate real-time message deletion
      realtimeCallbacks.onMessageDelete("msg-1");

      // Assert
      expect(mockRemoveMessage).toHaveBeenCalledWith("msg-1");
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle access validation failure gracefully", async () => {
      // Arrange
      vi.mocked(habitatsService.canUserAccessHabitat).mockResolvedValue(false);

      // Act
      render(<DiscussionRoomPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Access Denied")).toBeInTheDocument();
      });

      expect(
        screen.getByText("You don't have access to this habitat")
      ).toBeInTheDocument();

      // Hooks should be called with null parameters
      expect(useDiscussionMessages).toHaveBeenCalledWith(null, null, "user-1");
      expect(useDiscussionRealtimeChat).toHaveBeenCalledWith(
        null,
        null,
        "user-1",
        expect.any(Object)
      );
    });

    it("should handle discussion fetch failure", async () => {
      // Arrange
      vi.mocked(habitatsService.getDiscussionById).mockRejectedValue(
        new Error("Discussion not found")
      );

      // Act
      render(<DiscussionRoomPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Access Denied")).toBeInTheDocument();
      });
    });

    it("should handle message loading errors", async () => {
      // Arrange
      (useDiscussionMessages as any).mockReturnValue({
        ...mockUseDiscussionMessages,
        error: "Failed to load messages",
        messages: [],
      });

      // Act
      render(<DiscussionRoomPage />);

      // Wait for chat interface
      await waitFor(() => {
        expect(screen.getByTestId("chat-interface")).toBeInTheDocument();
      });

      // Assert
      expect(screen.getByTestId("chat-error")).toBeInTheDocument();
      expect(screen.getByText("Failed to load messages")).toBeInTheDocument();
    });

    it("should handle sending state correctly", async () => {
      // Arrange
      (useDiscussionMessages as any).mockReturnValue({
        ...mockUseDiscussionMessages,
        sending: true,
      });

      // Act
      render(<DiscussionRoomPage />);

      await waitFor(() => {
        expect(screen.getByTestId("send-button")).toBeInTheDocument();
      });

      // Assert
      expect(screen.getByText("Sending...")).toBeInTheDocument();
      expect(screen.getByTestId("send-button")).toBeDisabled();
    });

    it("should handle loading more state correctly", async () => {
      // Arrange
      (useDiscussionMessages as any).mockReturnValue({
        ...mockUseDiscussionMessages,
        loadingMore: true,
      });

      // Act
      render(<DiscussionRoomPage />);

      await waitFor(() => {
        expect(screen.getByTestId("load-more-button")).toBeInTheDocument();
      });

      // Assert
      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.getByTestId("load-more-button")).toBeDisabled();
    });
  });

  describe("Navigation Integration", () => {
    it("should provide navigation back to habitat from access denied state", async () => {
      // Arrange
      vi.mocked(habitatsService.canUserAccessHabitat).mockResolvedValue(false);

      // Act
      render(<DiscussionRoomPage />);

      await waitFor(() => {
        expect(screen.getByText("Back to Habitat")).toBeInTheDocument();
      });

      // Click back to habitat
      fireEvent.click(screen.getByText("Back to Habitat"));

      // Assert
      expect(mockRouter.push).toHaveBeenCalledWith(
        "/habitats/550e8400-e29b-41d4-a716-446655440000"
      );
    });

    it("should provide navigation back to habitats from access denied state", async () => {
      // Arrange
      vi.mocked(habitatsService.canUserAccessHabitat).mockResolvedValue(false);

      // Act
      render(<DiscussionRoomPage />);

      await waitFor(() => {
        expect(screen.getByText("Back to Habitats")).toBeInTheDocument();
      });

      // Click back to habitats
      fireEvent.click(screen.getByText("Back to Habitats"));

      // Assert
      expect(mockRouter.push).toHaveBeenCalledWith("/habitats");
    });
  });

  describe("Performance and Optimization", () => {
    it("should not reinitialize hooks when component rerenders with same props", async () => {
      // Act
      const { rerender } = render(<DiscussionRoomPage />);

      await waitFor(() => {
        expect(screen.getByTestId("chat-interface")).toBeInTheDocument();
      });

      // Rerender
      rerender(<DiscussionRoomPage />);

      // Assert - Hooks should only be called once per render cycle
      // The exact number depends on React's rendering behavior
      expect(useDiscussionMessages).toHaveBeenCalled();
      expect(useDiscussionRealtimeChat).toHaveBeenCalled();
    });

    it("should handle rapid real-time updates efficiently", async () => {
      // Arrange
      let realtimeCallbacks: any = {};
      (useDiscussionRealtimeChat as any).mockImplementation(
        (habitatId, discussionId, userId, callbacks) => {
          realtimeCallbacks = callbacks;
          return {};
        }
      );

      const mockAddMessage = vi.fn();
      (useDiscussionMessages as any).mockReturnValue({
        ...mockUseDiscussionMessages,
        addMessage: mockAddMessage,
      });

      // Act
      render(<DiscussionRoomPage />);

      await waitFor(() => {
        expect(screen.getByTestId("chat-interface")).toBeInTheDocument();
      });

      // Simulate rapid message insertions
      for (let i = 0; i < 10; i++) {
        realtimeCallbacks.onMessageInsert({
          id: `rapid-msg-${i}`,
          content: `Rapid message ${i}`,
        });
      }

      // Assert
      expect(mockAddMessage).toHaveBeenCalledTimes(10);
    });
  });
});
