import { StreamingRepository } from "../data/stream.repository";
import type { StreamMessage, StreamMessageInsert } from "./stream.types";

/**
 * Service for handling stream chat functionality
 */
export class StreamChatService {
  private repository: StreamingRepository;

  constructor(repository?: StreamingRepository) {
    this.repository = repository || new StreamingRepository();
  }

  /**
   * Send a message to a stream
   */
  async sendMessage(messageData: StreamMessageInsert): Promise<StreamMessage> {
    // Validate message content
    const trimmedMessage = messageData.message.trim();
    if (!trimmedMessage) {
      throw new Error("Message cannot be empty");
    }

    if (trimmedMessage.length > 500) {
      throw new Error("Message is too long (max 500 characters)");
    }

    // Check if user is a participant of the stream
    const isParticipant = await this.repository.isUserParticipant(
      messageData.stream_id,
      messageData.user_id
    );

    if (!isParticipant) {
      throw new Error("You must be a participant to send messages");
    }

    return await this.repository.sendMessage({
      stream_id: messageData.stream_id,
      user_id: messageData.user_id,
      message: trimmedMessage,
    });
  }

  /**
   * Get messages for a stream
   */
  async getMessages(
    streamId: string,
    userId: string,
    limit: number = 50
  ): Promise<StreamMessage[]> {
    // Check if user is a participant of the stream
    const isParticipant = await this.repository.isUserParticipant(
      streamId,
      userId
    );

    if (!isParticipant) {
      throw new Error("You must be a participant to view messages");
    }

    return await this.repository.getStreamMessages(streamId, limit);
  }

  /**
   * Delete a message (only by sender)
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    return await this.repository.deleteMessage(messageId, userId);
  }
}

// Export singleton instance
export const streamChatService = new StreamChatService();
