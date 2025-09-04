import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useBaseMessages } from "../use-base-messages";
import type { MessageWithProfile } from "@/features/habitats/domain/habitats.types";

// Mock the normalize error utility
vi.mock("@/utils/normalize-error", () => ({
  normalizeError: vi.fn((error) => ({
    message: error?.message || "Unknown error",
  })),
}));

// Mock message service functions
const mockFetchMessages = vi.fn();
const mockSendMessage = vi.fn();
const mockDeleteMessage = vi.fn();

const mockMessageService = {
  fetchMessages: mockFetchMessages,
  sendMessage: mockSendMessage,
  deleteMessage: mockDeleteMessage,
};

const mockMessage: MessageWithProfile = {
  id: "msg-1",
  habitat_id: "habitat-1",
  chat_id: "general",
  user_id: "user-1",
  content: "Test message",
  created_at: "2024-01-01T00:00:00Z",
  user_profile: {
    display_name: "Test User",
    avatar_url: "https://example.com/avatar.jpg",
  },
};

describe("useBaseMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() =>
      useBaseMessages({
        resourceId: "test-id",
        userId: "user-1",
        messageService: mockMessageService,
      })
    );

    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(true); // Loading starts immediately on mount
    expect(result.current.loadingMore).toBe(false);
    expect(result.current.sending).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.hasMore).toBe(true);
  });

  it("should fetch messages on mount", async () => {
    mockFetchMessages.mockResolvedValue([mockMessage]);

    const { result } = renderHook(() =>
      useBaseMessages({
        resourceId: "test-id",
        userId: "user-1",
        messageService: mockMessageService,
      })
    );

    expect(result.current.loading).toBe(true);

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 10000 }
    );

    expect(mockFetchMessages).toHaveBeenCalledWith("test-id", "user-1", 50, 0);
    expect(result.current.messages).toEqual([mockMessage]);
  });

  it("should handle fetch errors", async () => {
    const error = new Error("Fetch failed");
    mockFetchMessages.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useBaseMessages({
        resourceId: "test-id",
        userId: "user-1",
        messageService: mockMessageService,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Fetch failed");
    expect(result.current.messages).toEqual([]);
  });

  it("should send messages successfully", async () => {
    const newMessage = { ...mockMessage, id: "msg-2", content: "New message" };
    mockFetchMessages.mockResolvedValue([mockMessage]);
    mockSendMessage.mockResolvedValue(newMessage);

    const { result } = renderHook(() =>
      useBaseMessages({
        resourceId: "test-id",
        userId: "user-1",
        messageService: mockMessageService,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.sendMessage("New message");
    });

    expect(mockSendMessage).toHaveBeenCalledWith(
      "test-id",
      "user-1",
      "New message"
    );
    expect(result.current.messages).toEqual([newMessage, mockMessage]);
    expect(result.current.sending).toBe(false);
  });

  it("should handle send message errors", async () => {
    const error = new Error("Send failed");
    mockFetchMessages.mockResolvedValue([mockMessage]);
    mockSendMessage.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useBaseMessages({
        resourceId: "test-id",
        userId: "user-1",
        messageService: mockMessageService,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.sendMessage("New message");
      })
    ).rejects.toThrow("Send failed");

    expect(result.current.sending).toBe(false);
    expect(result.current.error).toBe("Send failed");
  });

  it("should load more messages", async () => {
    const moreMessages = [
      { ...mockMessage, id: "msg-2", content: "Message 2" },
      { ...mockMessage, id: "msg-3", content: "Message 3" },
    ];

    mockFetchMessages
      .mockResolvedValueOnce([mockMessage])
      .mockResolvedValueOnce(moreMessages);

    const { result } = renderHook(() =>
      useBaseMessages({
        resourceId: "test-id",
        userId: "user-1",
        messageService: mockMessageService,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(mockFetchMessages).toHaveBeenCalledTimes(2);
    expect(mockFetchMessages).toHaveBeenLastCalledWith(
      "test-id",
      "user-1",
      50,
      1
    );
    expect(result.current.messages).toEqual([mockMessage, ...moreMessages]);
  });

  it("should delete messages", async () => {
    mockFetchMessages.mockResolvedValue([mockMessage]);
    mockDeleteMessage.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useBaseMessages({
        resourceId: "test-id",
        userId: "user-1",
        messageService: mockMessageService,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteMessage("msg-1");
    });

    expect(mockDeleteMessage).toHaveBeenCalledWith(
      "msg-1",
      "user-1",
      "test-id"
    );
    expect(result.current.messages).toEqual([]);
  });

  it("should add messages from real-time updates", async () => {
    mockFetchMessages.mockResolvedValue([mockMessage]);

    const { result } = renderHook(() =>
      useBaseMessages({
        resourceId: "test-id",
        userId: "user-1",
        messageService: mockMessageService,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newMessage = {
      ...mockMessage,
      id: "msg-2",
      content: "Real-time message",
    };

    act(() => {
      result.current.addMessage(newMessage);
    });

    expect(result.current.messages).toEqual([newMessage, mockMessage]);
  });

  it("should update messages from real-time updates", async () => {
    mockFetchMessages.mockResolvedValue([mockMessage]);

    const { result } = renderHook(() =>
      useBaseMessages({
        resourceId: "test-id",
        userId: "user-1",
        messageService: mockMessageService,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const updatedMessage = { ...mockMessage, content: "Updated content" };

    act(() => {
      result.current.updateMessage(updatedMessage);
    });

    expect(result.current.messages).toEqual([updatedMessage]);
  });

  it("should remove messages from real-time updates", async () => {
    mockFetchMessages.mockResolvedValue([mockMessage]);

    const { result } = renderHook(() =>
      useBaseMessages({
        resourceId: "test-id",
        userId: "user-1",
        messageService: mockMessageService,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.removeMessage("msg-1");
    });

    expect(result.current.messages).toEqual([]);
  });

  it("should refresh messages", async () => {
    const refreshedMessages = [
      { ...mockMessage, id: "msg-2", content: "Refreshed message" },
    ];

    mockFetchMessages
      .mockResolvedValueOnce([mockMessage])
      .mockResolvedValueOnce(refreshedMessages);

    const { result } = renderHook(() =>
      useBaseMessages({
        resourceId: "test-id",
        userId: "user-1",
        messageService: mockMessageService,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.refresh();
    });

    expect(mockFetchMessages).toHaveBeenCalledTimes(2);
    expect(result.current.messages).toEqual(refreshedMessages);
  });

  it("should handle auto-refresh", async () => {
    mockFetchMessages.mockResolvedValue([mockMessage]);

    const { result } = renderHook(() =>
      useBaseMessages({
        resourceId: "test-id",
        userId: "user-1",
        messageService: mockMessageService,
        options: {
          autoRefresh: true,
          refreshInterval: 1000,
        },
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetchMessages).toHaveBeenCalledTimes(1);

    // Fast-forward time to trigger auto-refresh
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockFetchMessages).toHaveBeenCalledTimes(2);
    });
  });

  it("should clear errors", async () => {
    const error = new Error("Test error");
    mockFetchMessages.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useBaseMessages({
        resourceId: "test-id",
        userId: "user-1",
        messageService: mockMessageService,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Test error");

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });

  it("should not fetch when resourceId or userId is null", () => {
    const { result } = renderHook(() =>
      useBaseMessages({
        resourceId: null,
        userId: "user-1",
        messageService: mockMessageService,
      })
    );

    expect(mockFetchMessages).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.hasMore).toBe(false);
  });
});
