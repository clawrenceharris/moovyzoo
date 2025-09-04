import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useDiscussionMessages } from "../useDiscussionMessages";
import { habitatsService } from "../../domain/habitats.service";

// Mock the base hook
vi.mock("@/hooks/base/use-base-messages", () => ({
  useBaseMessages: vi.fn(),
}));

// Mock the habitats service
vi.mock("../../domain/habitats.service", () => ({
  habitatsService: {
    getMessagesByDiscussion: vi.fn(),
    sendMessageToDiscussion: vi.fn(),
    deleteMessage: vi.fn(),
  },
}));

import { useBaseMessages } from "@/hooks/base/use-base-messages";

const mockUseBaseMessages = vi.mocked(useBaseMessages);
const mockHabitatsService = vi.mocked(habitatsService);

describe("useDiscussionMessages", () => {
  const mockBaseReturn = {
    messages: [],
    loading: false,
    loadingMore: false,
    sending: false,
    error: null,
    hasMore: true,
    sendMessage: vi.fn(),
    deleteMessage: vi.fn(),
    loadMore: vi.fn(),
    refresh: vi.fn(),
    clearError: vi.fn(),
    addMessage: vi.fn(),
    updateMessage: vi.fn(),
    removeMessage: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBaseMessages.mockReturnValue(mockBaseReturn);
  });

  it("should call useBaseMessages with correct parameters", () => {
    renderHook(() =>
      useDiscussionMessages("habitat-1", "discussion-1", "user-1", {
        limit: 25,
      })
    );

    expect(mockUseBaseMessages).toHaveBeenCalledWith({
      resourceId: "discussion-1",
      userId: "user-1",
      messageService: {
        fetchMessages: expect.any(Function),
        sendMessage: expect.any(Function),
        deleteMessage: expect.any(Function),
      },
      options: { limit: 25 },
    });
  });

  it("should return all base hook functionality", () => {
    const { result } = renderHook(() =>
      useDiscussionMessages("habitat-1", "discussion-1", "user-1")
    );

    expect(result.current).toEqual(mockBaseReturn);
  });

  it("should handle null discussionId", () => {
    renderHook(() => useDiscussionMessages("habitat-1", null, "user-1"));

    expect(mockUseBaseMessages).toHaveBeenCalledWith({
      resourceId: null,
      userId: "user-1",
      messageService: expect.any(Object),
      options: {},
    });
  });

  it("should handle null userId", () => {
    renderHook(() => useDiscussionMessages("habitat-1", "discussion-1", null));

    expect(mockUseBaseMessages).toHaveBeenCalledWith({
      resourceId: "discussion-1",
      userId: null,
      messageService: expect.any(Object),
      options: {},
    });
  });

  it("should create message service with correct methods", () => {
    renderHook(() =>
      useDiscussionMessages("habitat-1", "discussion-1", "user-1")
    );

    const call = mockUseBaseMessages.mock.calls[0][0];
    const messageService = call.messageService;

    expect(messageService).toHaveProperty("fetchMessages");
    expect(messageService).toHaveProperty("sendMessage");
    expect(messageService).toHaveProperty("deleteMessage");
  });
});
