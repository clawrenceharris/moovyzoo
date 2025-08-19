// Components
export { AIChatProvider } from './components/AIChatProvider';
export { AIChatFAB } from './components/AIChatFAB';
export { AIChatSidebar } from './components/AIChatSidebar';
export { ChatInterface } from './components/ChatInterface';
export { MessageList } from './components/MessageList';
export { MessageBubble } from './components/MessageBubble';
export { ChatInput } from './components/ChatInput';
export { StarterPrompts } from './components/StarterPrompts';
export { TypingIndicator } from './components/TypingIndicator';

// Hooks
export { useChat } from './hooks/use-chat';
export { useChatSidebar } from './hooks/use-chat-sidebar';
export { useImageUpload } from './hooks/use-image-upload';

// Types
export type { 
  Message, 
  ChatState, 
  StarterPrompt, 
  ImageAttachment,
  ChatInputProps,
  MessageBubbleProps,
  MessageListProps,
  StarterPromptsProps
} from './types/chat';

// Utils
export { 
  createUserMessage, 
  createAssistantMessage, 
  formatTimestamp,
  formatMessageContent,
  copyMessageToClipboard 
} from './utils/message-formatting';

export { 
  processImageFile, 
  validateImageFile, 
  compressImage,
  formatFileSize 
} from './utils/image-processing';

export { 
  createAIAgent, 
  createChatModel, 
  configureLangSmith 
} from './utils/langraph-config';