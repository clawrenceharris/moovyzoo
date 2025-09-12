'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

interface UseChatSidebarReturn {
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

interface ChatSidebarContextType extends UseChatSidebarReturn {}

const ChatSidebarContext = createContext<ChatSidebarContextType | undefined>(undefined);

export function ChatSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSidebar = useCallback(() => {
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = 'unset';
  }, []);

  const toggleSidebar = useCallback(() => {
    if (isOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }, [isOpen, openSidebar, closeSidebar]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeSidebar();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeSidebar]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const value = {
    isOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
  };

  return (
    <ChatSidebarContext.Provider value={value}>
      {children}
    </ChatSidebarContext.Provider>
  );
}

export const useChatSidebar = (): UseChatSidebarReturn => {
  const context = useContext(ChatSidebarContext);
  if (context === undefined) {
    throw new Error('useChatSidebar must be used within a ChatSidebarProvider');
  }
  return context;
};
