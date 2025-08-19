'use client';

import { useState, useCallback } from 'react';
import { ImageAttachment } from '../types/chat';
import { processImageFile } from '../utils/image-processing';

interface UseImageUploadReturn {
  attachment: ImageAttachment | null;
  isProcessing: boolean;
  handleFileSelect: (file: File) => Promise<void>;
  removeAttachment: () => void;
  error: string | null;
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [attachment, setAttachment] = useState<ImageAttachment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const processedImage = await processImageFile(file);
      
      if (processedImage.isValid) {
        setAttachment(processedImage);
      } else {
        setError(processedImage.error || 'Failed to process image');
        setAttachment(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process image';
      setError(errorMessage);
      setAttachment(null);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const removeAttachment = useCallback(() => {
    if (attachment?.preview) {
      // Clean up the blob URL to prevent memory leaks
      URL.revokeObjectURL(attachment.preview);
    }
    setAttachment(null);
    setError(null);
  }, [attachment]);

  return {
    attachment,
    isProcessing,
    handleFileSelect,
    removeAttachment,
    error,
  };
};