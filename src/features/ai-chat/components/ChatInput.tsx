'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useImageUpload } from '../hooks/use-image-upload';
import { formatFileSize } from '../utils/image-processing';

interface ChatInputProps {
  onSendMessage: (message: string, image?: File) => void;
  disabled: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({ 
  onSendMessage, 
  disabled, 
  placeholder = "Ask me about movies, TV shows, or anything cinema-related...",
  className 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    attachment,
    isProcessing,
    handleFileSelect,
    removeAttachment,
    error: imageError
  } = useImageUpload();

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage && !attachment) return;
    if (disabled || isProcessing) return;

    onSendMessage(trimmedMessage, attachment?.file);
    setMessage('');
    removeAttachment();
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    e.target.value = '';
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  const canSend = (message.trim() || attachment) && !disabled && !isProcessing;

  return (
    <div className={cn('border-t border-brand-black-15 bg-brand-black-08', className)}>
      {/* Image attachment preview */}
      {attachment && (
        <div className="p-4 border-b border-brand-black-15">
          <div className="flex items-start gap-3 p-3 bg-brand-black-12 rounded-lg">
            <div className="relative">
              <img
                src={attachment.preview}
                alt="Attachment preview"
                className="w-16 h-16 object-cover rounded-lg"
              />
              <button
                onClick={removeAttachment}
                className="absolute -top-2 -right-2 w-6 h-6 bg-brand-red-45 rounded-full flex items-center justify-center hover:bg-brand-red-40 transition-colors"
                aria-label="Remove image"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {attachment.file.name}
              </p>
              <p className="text-xs text-brand-grey-70">
                {formatFileSize(attachment.file.size)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image processing error */}
      {imageError && (
        <div className="p-4 border-b border-brand-black-15">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{imageError}</p>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4">
        <div className="flex items-end gap-3">
          {/* File attachment button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isProcessing}
            className={cn(
              'flex-shrink-0 p-2 rounded-lg transition-colors',
              'text-brand-grey-70 hover:text-white hover:bg-brand-black-15',
              'focus:outline-none focus:ring-2 focus:ring-brand-red-55',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label="Attach image"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-brand-grey-70 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className={cn(
                'w-full resize-none rounded-lg px-4 py-3 pr-12',
                'bg-brand-black-12 border border-brand-black-20',
                'text-white placeholder-brand-grey-70 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-brand-red-55 focus:border-transparent',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'scrollbar-thin scrollbar-thumb-brand-black-20 scrollbar-track-transparent'
              )}
              style={{ minHeight: '64px', maxHeight: '120px' }}
            />
            
            {/* Character count */}
            {message.length > 3800 && (
              <div className="absolute bottom-1 right-12 text-xs text-brand-grey-70">
                {message.length}/4000
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={!canSend}
            className={cn(
              'flex-shrink-0 p-2 rounded-lg transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-brand-red-55',
              canSend ? [
                'bg-brand-red-45 hover:bg-brand-red-40 text-white',
                'shadow-lg hover:shadow-xl'
              ] : [
                'bg-brand-black-20 text-brand-grey-70 cursor-not-allowed'
              ]
            )}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Helper text */}
        <div className="mt-2 text-xs text-brand-grey-70">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}