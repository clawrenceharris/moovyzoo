import { useState } from 'react';
import type { ContentRecommendation } from '@/features/ai-recommendations/types/recommendations';

/**
 * Hook for managing ContentDetailModal state
 */
export function useContentDetailModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentRecommendation | null>(null);

  const openModal = (recommendation: ContentRecommendation) => {
    setSelectedContent(recommendation);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // Keep selectedContent for a smoother close transition
    setTimeout(() => {
      setSelectedContent(null);
    }, 200);
  };

  return {
    isOpen,
    selectedContent,
    openModal,
    closeModal,
  };
}
