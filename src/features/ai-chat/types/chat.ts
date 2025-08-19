export interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    image?: {
        url: string;
        alt: string;
        size: number;
    };
    status: 'sending' | 'sent' | 'error';
}

export interface ChatState {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    conversationId: string | null;
}

export interface StarterPrompt {
    id: string;
    category: 'creative' | 'analytical' | 'educational' | 'casual';
    title: string;
    prompt: string;
    icon: string;
}

export interface ImageAttachment {
    file: File;
    preview: string;
    isValid: boolean;
    error?: string;
}

export interface ChatInputProps {
    onSendMessage: (message: string, image?: File) => void;
    disabled: boolean;
    placeholder?: string;
}

export interface MessageBubbleProps {
    message: Message;
    isUser: boolean;
}

export interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
}

export interface StarterPromptsProps {
    onSelectPrompt: (prompt: string) => void;
}