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

const STORAGE_KEY = 'MoovyZoo-ai-chat-messages';

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
        const messagesWithDates = parsedMessages.map((msg: Message & { timestamp: string }) => ({
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

    lastUserMessageRef.current = { content, image };

    const userMessage = createUserMessage(content, image);
    setMessages(prev => [...prev, userMessage]);
    setError(null);
    setIsLoading(true);

    try {
      updateMessageStatus(userMessage.id, 'sent');

      const currentMessages = [...messages, userMessage];
      const aiMessage = createAssistantMessage('');
      setMessages(prev => [...prev, aiMessage]);
      
      // Call the API route with Server-Sent Events
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: currentMessages.map(msg => ({
            id: msg.id,
            content: msg.content,
            role: msg.role,
            timestamp: msg.timestamp.toISOString(),
            status: msg.status
          })),
          conversationId: conversationId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle Server-Sent Events streaming
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'content') {
                    accumulatedContent += data.content;
                    
                    setMessages(prev => prev.map(msg => 
                      msg.id === aiMessage.id 
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    ));
                  } else if (data.type === 'error') {
                    throw new Error(data.error);
                  } else if (data.type === 'complete') {
                    break;
                  }
                } catch (parseError) {
                  console.error('Error parsing SSE data:', parseError);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }
    } catch (err) {
      console.error('Chat API error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      updateMessageStatus(userMessage.id, 'error');
      
      setMessages(prev => prev.filter(msg => 
        !(msg.role === 'assistant' && msg.content.trim() === '')
      ));
    } finally {
      setIsLoading(false);
    }
  }, [messages, updateMessageStatus, conversationId]);

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