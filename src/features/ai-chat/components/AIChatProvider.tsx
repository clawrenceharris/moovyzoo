'use client';

import { useChatSidebar } from '../hooks/use-chat-sidebar';
import { AIChatSidebar } from './AIChatSidebar';

export function AIChatProvider() {
  const { isOpen, closeSidebar } = useChatSidebar();

  return (
    <>
      <AIChatSidebar isOpen={isOpen} onClose={closeSidebar} />
    </>
  );
}