import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useParams, useRouter } from "next/navigation";
import DiscussionRoomPage from "../page";
import { habitatsService } from "@/features/habitats/domain/habitats.service";
import { useUser } from "@/hooks/use-user";
import {
  useDiscussionMessages,
  useDiscussionRealtimeChat,
} from "@/features/habitats/hooks";
import { normalizeError } from "@/utils/normalize-error";

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

vi.mock("@/utils/normalize-error", () => ({
  normalizeError: vi.fn(),
}));

vi.mock("@/features/habitats/components", () => ({
  ChatInterface: ({ messages, discussion, error }: any) => (
    <div data-testid="chat-interface">
      {error && <div data-testid="chat-error">{error}</div>}
      {discussion && <div data-testid="discussion-name">{discussion.name}</div>}
      <div data-testid="message-count">{messages?.length || 0} messages</div>
    </div>
  ),
}));

describe("DiscussionRoomPage", () => {
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
    name: "Test Discussion",
    description: "Test Description",
    created_by: "user-1",
    created_at: "2024-01-01T00:00:00Z",
    is_active: true,
  };

  const mockHabitat = {
    id: "550e8400-e29b-41d4-a716-446655440000",
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
  };

  const mockMessages = [
    {
      id: "msg-1",
      habitat_id: "550e8400-e29b-41d4-a716-446655440000",
      chat_id: "550e8400-e29b-41d4-a716-446655440001",
      user_id: "user-1",
      content: "Test message",
      created_at: "2024-01-01T00:00:00Z",
    },
  ];

  const mockUseDiscussionMessages = {
    messages: mockMessages,
    loading: false,
    loadingMore: false,
    sending: false,
    error: null,
    hasMore: false,
    sendMessage: vi.fn(),
    loadMore: vi.fn(),
    addMessage: vi.fn(),
    updateMessage: vi.fn(),
    removeMessage: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    (useParams as any).mockReturnValue(mockParams);
    (useUser as any).mockReturnValue({ user: mockUser });
    (useDiscussionMessages as any).mockReturnValue(mockUseDiscussionMessages);
    (useDiscussionRealtimeChat as any).mockReturnValue({});
  });

  describe("Loading States", () => {
    it("should show loading state when user is not available", () => {
      // Arrange
      (useUser as any).mockReturnValue({ user: null });

      // Act
      render(<DiscussionRoomPage />);

      // Assert
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should show loading state while validating access", async () => {
      // Arrange
      vi.mocked(habitatsService.canUserAccessHabitat).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      // Act
      render(<DiscussionRoomPage />);

      // Assert
      expect(screen.getByText("Validating access...")).toBeInTheDocument();
    });
  });

  describe("Invalid Parameters", () => {
    it("should show error for invalid habitat ID", () => {
      // Arrange
      (useParams as any).mockReturnValue({
        id: "invalid-id",
        discussionId: "discussion-1",
      });

      // Act
      render(<DiscussionRoomPage />);

      // Assert
      expect(screen.getByText("Invalid Discussion Room")).toBeInTheDocument();
      expect(
        screen.getByText(
          "The discussion room you're looking for doesn't exist or the link is invalid."
        )
      ).toBeInTheDocument();
    });

    it("should show error for invalid discussion ID", () => {
      // Arrange
      (useParams as any).mockReturnValue({
        id: "habitat-1",
        discussionId: "invalid-id",
      });

      // Act
      render(<DiscussionRoomPage />);

      // Assert
      expect(screen.getByText("Invalid Discussion Room")).toBeInTheDocument();
    });

    it("should navigate to habitats when back button is clicked", () => {
      // Arrange
      (useParams as any).mockReturnValue({
        id: "invalid-id",
        discussionId: "discussion-1",
      });

      // Act
      render(<DiscussionRoomPage />);

      // Click back button
      const backButton = screen.getByText("Back to Habitats");
      backButton.click();

      // Assert
      expect(mockRouter.push).toHaveBeenCalledWith("/habitats");
    });
  });

  describe("Access Control", () => {
    it("should show access denied when user cannot access habitat", async () => {
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
    });

    it("should show error when access validation fails", async () => {
      // Arrange
      const error = new Error("Network error");
      const normalizedError = { message: "Failed to validate access" };
      vi.mocked(habitatsService.canUserAccessHabitat).mockRejectedValue(error);
      vi.mocked(normalizeError).mockReturnValue(normalizedError);

      // Act
      render(<DiscussionRoomPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Access Denied")).toBeInTheDocument();
      });
      expect(screen.getByText("Failed to validate access")).toBeInTheDocument();
    });

    it("should show error when discussion does not belong to habitat", async () => {
      // Arrange
      vi.mocked(habitatsService.canUserAccessHabitat).mockResolvedValue(true);
      vi.mocked(habitatsService.getDiscussionById).mockResolvedValue({
        ...mockDiscussion,
        habitat_id: "different-habitat",
      });
      vi.mocked(habitatsService.getHabitatById).mockResolvedValue(mockHabitat);

      // Act
      render(<DiscussionRoomPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Access Denied")).toBeInTheDocument();
      });
      expect(
        screen.getByText("Discussion does not belong to this habitat")
      ).toBeInTheDocument();
    });
  });

  describe("Successful Access", () => {
    beforeEach(() => {
      vi.mocked(habitatsService.canUserAccessHabitat).mockResolvedValue(true);
      vi.mocked(habitatsService.getDiscussionById).mockResolvedValue(
        mockDiscussion
      );
      vi.mocked(habitatsService.getHabitatById).mockResolvedValue(mockHabitat);
    });

    it("should render chat interface when access is granted", async () => {
      // Act
      render(<DiscussionRoomPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId("chat-interface")).toBeInTheDocument();
      });
      expect(screen.getByTestId("discussion-name")).toHaveTextContent(
        "Test Discussion"
      );
      expect(screen.getByTestId("message-count")).toHaveTextContent(
        "1 messages"
      );
    });

    it("should call useDiscussionMessages with correct parameters", async () => {
      // Act
      render(<DiscussionRoomPage />);

      // Wait for access validation
      await waitFor(() => {
        expect(screen.getByTestId("chat-interface")).toBeInTheDocument();
      });

      // Assert
      expect(useDiscussionMessages).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000",
        "550e8400-e29b-41d4-a716-446655440001",
        "user-1"
      );
    });

    it("should call useDiscussionRealtimeChat with correct parameters", async () => {
      // Act
      render(<DiscussionRoomPage />);

      // Wait for access validation
      await waitFor(() => {
        expect(screen.getByTestId("chat-interface")).toBeInTheDocument();
      });

      // Assert
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
    });

    it("should validate habitat access with correct parameters", async () => {
      // Act
      render(<DiscussionRoomPage />);

      // Assert
      await waitFor(() => {
        expect(habitatsService.canUserAccessHabitat).toHaveBeenCalledWith(
          "550e8400-e29b-41d4-a716-446655440000",
          "user-1"
        );
      });
    });

    it("should fetch discussion and habitat data in parallel", async () => {
      // Act
      render(<DiscussionRoomPage />);

      // Assert
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
    });
  });

  describe("Navigation", () => {
    it("should provide back to habitat button in access denied state", async () => {
      // Arrange
      vi.mocked(habitatsService.canUserAccessHabitat).mockResolvedValue(false);

      // Act
      render(<DiscussionRoomPage />);

      await waitFor(() => {
        expect(screen.getByText("Access Denied")).toBeInTheDocument();
      });

      // Click back to habitat button
      const backButton = screen.getByText("Back to Habitat");
      backButton.click();

      // Assert
      expect(mockRouter.push).toHaveBeenCalledWith(
        "/habitats/550e8400-e29b-41d4-a716-446655440000"
      );
    });
  });

  describe("Hook Integration", () => {
    beforeEach(() => {
      vi.mocked(habitatsService.canUserAccessHabitat).mockResolvedValue(true);
      vi.mocked(habitatsService.getDiscussionById).mockResolvedValue(
        mockDiscussion
      );
      vi.mocked(habitatsService.getHabitatById).mockResolvedValue(mockHabitat);
    });

    it("should not call hooks when access is not granted", () => {
      // Arrange
      vi.mocked(habitatsService.canUserAccessHabitat).mockResolvedValue(false);

      // Act
      render(<DiscussionRoomPage />);

      // Assert
      expect(useDiscussionMessages).toHaveBeenCalledWith(null, null, "user-1");
      expect(useDiscussionRealtimeChat).toHaveBeenCalledWith(
        null,
        null,
        "user-1",
        expect.any(Object)
      );
    });

    it("should display chat error when messages hook returns error", async () => {
      // Arrange
      (useDiscussionMessages as any).mockReturnValue({
        ...mockUseDiscussionMessages,
        error: "Failed to load messages",
      });

      // Act
      render(<DiscussionRoomPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId("chat-error")).toHaveTextContent(
          "Failed to load messages"
        );
      });
    });
  });
});
