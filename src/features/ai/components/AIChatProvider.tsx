'use client';

import { useChatSidebar } from '../hooks/use-chat-sidebar';
import { AIChatFAB } from './AIChatFAB';
import { AIChatSidebar } from './AIChatSidebar';

export function AIChatProvider() {
  const { isOpen, toggleSidebar, closeSidebar } = useChatSidebar();

  return (
    <>
      <AIChatFAB 
        isOpen={isOpen} 
        onClick={toggleSidebar}
      />
      <AIChatSidebar 
        isOpen={isOpen} 
        onClose={closeSidebar}
      />
    </>
  );
}