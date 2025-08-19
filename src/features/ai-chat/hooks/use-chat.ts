'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Message, ChatState } from '../types/chat';
import { createUserMessage, createAssistantMessage, generateMessageId } from '../utils/message-formatting';

interface UseChatReturn extends ChatState {
  sendMessage: (content: string, image?: File) => Promise<void>;
  clearMessages: () => void;
  retryLastMessage: () => Promise<void>;
  updateMessageStatus: (messageId: string, status: Message['status']) => void;
}

const STORAGE_KEY = 'Zoovie-ai-chat-messages';

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId] = useState<string>(() => generateMessageId());
  
  const lastUserMessageRef = useRef<{ content: string; image?: File } | null>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedMessages = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error('Failed to load chat messages from localStorage:', error);
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save chat messages to localStorage:', error);
    }
  }, [messages]);

  const updateMessageStatus = useCallback((messageId: string, status: Message['status']) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status } : msg
    ));
  }, []);

  const sendMessage = useCallback(async (content: string, image?: File) => {
    if (!content.trim() && !image) return;

    // Store the user message for potential retry
    lastUserMessageRef.current = { content, image };

    // Create and add user message
    const userMessage = createUserMessage(content, image);
    setMessages(prev => [...prev, userMessage]);
    setError(null);
    setIsLoading(true);

    try {
      // Update user message status to sent
      updateMessageStatus(userMessage.id, 'sent');

      // TODO: Replace with actual LangGraph.js integration
      // For now, simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const aiResponse = createAssistantMessage(
        `I received your message: "${content}". This is a placeholder response while we integrate LangGraph.js. ${image ? 'I can see you attached an image as well!' : ''}`
      );
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      updateMessageStatus(userMessage.id, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [updateMessageStatus]);

  const retryLastMessage = useCallback(async () => {
    if (!lastUserMessageRef.current) return;
    
    const { content, image } = lastUserMessageRef.current;
    await sendMessage(content, image);
  }, [sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    lastUserMessageRef.current = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear chat messages from localStorage:', error);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    conversationId,
    sendMessage,
    clearMessages,
    retryLastMessage,
    updateMessageStatus,
  };
};