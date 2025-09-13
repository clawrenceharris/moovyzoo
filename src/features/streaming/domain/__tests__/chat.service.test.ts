import { describe, it, expect, vi, beforeEach } from "vitest";
import { StreamChatService } from "../chat.service";
import { StreamingRepository } from "../../data/stream.repository";
import type { StreamMessage } from "../stream.types";

// Mock the repository
vi.mock("../../data/stream.repository");

describe("StreamChatService", () => {
  let chatService: StreamChatService;
  let mockRepository: vi.Mocked<StreamingRepository>;

  beforeEach(() => {
    mockRepository = {
      sendMessage: vi.fn(),
      getStreamMessages: vi.fn(),
      deleteMessage: vi.fn(),
      isUserParticipant: vi.fn(),
    } as any;

    chatService = new StreamChatService(mockRepository);
  });

  describe("sendMessage", () => {
    const validMessageData = {
      stream_id: "stream-1",
      user_id: "user-1",
      message: "Hello world!",
    };

    const mockMessage: StreamMessage = {
      id: "msg-1",
      stream_id: "stream-1",
      user_id: "user-1",
      message: "Hello world!",
      created_at: "2024-01-01T00:00:00Z",
      profile: {
        display_name: "Test User",
        avatar_url: "avatar.jpg",
      },
    };

    it("should send a valid message successfully", async () => {
      // Arrange
      mockRepository.isUserParticipant.mockResolvedValue(true);
      mockRepository.sendMessage.mockResolvedValue(mockMessage);

      // Act
      const result = await chatService.sendMessage(validMessageData);

      // Assert
      expect(mockRepository.isUserParticipant).toHaveBeenCalledWith(
        "stream-1",
        "user-1"
      );
      expect(mockRepository.sendMessage).toHaveBeenCalledWith({
        stream_id: "stream-1",
        user_id: "user-1",
        message: "Hello world!",
      });
      expect(result).toEqual(mockMessage);
    });

    it("should trim whitespace from message", async () => {
      // Arrange
      mockRepository.isUserParticipant.mockResolvedValue(true);
      mockRepository.sendMessage.mockResolvedValue(mockMessage);

      // Act
      await chatService.sendMessage({
        ...validMessageData,
        message: "  Hello world!  ",
      });

      // Assert
      expect(mockRepository.sendMessage).toHaveBeenCalledWith({
        stream_id: "stream-1",
        user_id: "user-1",
        message: "Hello world!",
      });
    });

    it("should reject empty messages", async () => {
      // Arrange
      mockRepository.isUserParticipant.mockResolvedValue(true);

      // Act & Assert
      await expect(
        chatService.sendMessage({
          ...validMessageData,
          message: "   ",
        })
      ).rejects.toThrow("Message cannot be empty");

      expect(mockRepository.sendMessage).not.toHaveBeenCalled();
    });

    it("should reject messages that are too long", async () => {
      // Arrange
      mockRepository.isUserParticipant.mockResolvedValue(true);
      const longMessage = "a".repeat(501);

      // Act & Assert
      await expect(
        chatService.sendMessage({
          ...validMessageData,
          message: longMessage,
        })
      ).rejects.toThrow("Message is too long (max 500 characters)");

      expect(mockRepository.sendMessage).not.toHaveBeenCalled();
    });

    it("should reject messages from non-participants", async () => {
      // Arrange
      mockRepository.isUserParticipant.mockResolvedValue(false);

      // Act & Assert
      await expect(chatService.sendMessage(validMessageData)).rejects.toThrow(
        "You must be a participant to send messages"
      );

      expect(mockRepository.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe("getMessages", () => {
    const mockMessages: StreamMessage[] = [
      {
        id: "msg-1",
        stream_id: "stream-1",
        user_id: "user-1",
        message: "Hello!",
        created_at: "2024-01-01T00:00:00Z",
        profile: { display_name: "User 1" },
      },
      {
        id: "msg-2",
        stream_id: "stream-1",
        user_id: "user-2",
        message: "Hi there!",
        created_at: "2024-01-01T00:01:00Z",
        profile: { display_name: "User 2" },
      },
    ];

    it("should get messages for participants", async () => {
      // Arrange
      mockRepository.isUserParticipant.mockResolvedValue(true);
      mockRepository.getStreamMessages.mockResolvedValue(mockMessages);

      // Act
      const result = await chatService.getMessages("stream-1", "user-1");

      // Assert
      expect(mockRepository.isUserParticipant).toHaveBeenCalledWith(
        "stream-1",
        "user-1"
      );
      expect(mockRepository.getStreamMessages).toHaveBeenCalledWith(
        "stream-1",
        50
      );
      expect(result).toEqual(mockMessages);
    });

    it("should use custom limit", async () => {
      // Arrange
      mockRepository.isUserParticipant.mockResolvedValue(true);
      mockRepository.getStreamMessages.mockResolvedValue(mockMessages);

      // Act
      await chatService.getMessages("stream-1", "user-1", 25);

      // Assert
      expect(mockRepository.getStreamMessages).toHaveBeenCalledWith(
        "stream-1",
        25
      );
    });

    it("should reject non-participants", async () => {
      // Arrange
      mockRepository.isUserParticipant.mockResolvedValue(false);

      // Act & Assert
      await expect(
        chatService.getMessages("stream-1", "user-1")
      ).rejects.toThrow("You must be a participant to view messages");

      expect(mockRepository.getStreamMessages).not.toHaveBeenCalled();
    });
  });

  describe("deleteMessage", () => {
    it("should delete a message", async () => {
      // Arrange
      mockRepository.deleteMessage.mockResolvedValue();

      // Act
      await chatService.deleteMessage("msg-1", "user-1");

      // Assert
      expect(mockRepository.deleteMessage).toHaveBeenCalledWith(
        "msg-1",
        "user-1"
      );
    });
  });
});
