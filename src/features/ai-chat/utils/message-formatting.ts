import { Message } from '../types/chat';

export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const createUserMessage = (content: string, image?: File): Message => {
  const message: Message = {
    id: generateMessageId(),
    content,
    role: 'user',
    timestamp: new Date(),
    status: 'sending'
  };

  if (image) {
    message.image = {
      url: URL.createObjectURL(image),
      alt: `User uploaded image: ${image.name}`,
      size: image.size
    };
  }

  return message;
};

export const createAssistantMessage = (content: string): Message => {
  return {
    id: generateMessageId(),
    content,
    role: 'assistant',
    timestamp: new Date(),
    status: 'sent'
  };
};

export const formatTimestamp = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return timestamp.toLocaleDateString();
};

export const formatMessageContent = (content: string): string => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
};

export const truncateMessage = (content: string, maxLength: number = 100): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
};

export const getMessagePreview = (message: Message): string => {
  if (message.image && !message.content.trim()) {
    return '📷 Image';
  }
  if (message.image && message.content.trim()) {
    return `📷 ${truncateMessage(message.content, 50)}`;
  }
  return truncateMessage(message.content);
};

export const copyMessageToClipboard = async (message: Message): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(message.content);
    return true;
  } catch (error) {
    console.error('Failed to copy message:', error);
    return false;
  }
};