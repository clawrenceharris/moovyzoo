'use client';

import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIChatFABProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function AIChatFAB({ isOpen, onClick, className }: AIChatFABProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Base styles
        'fixed bottom-6 right-6 z-50',
        'w-14 h-14 rounded-full',
        'flex items-center justify-center',
        'shadow-lg hover:shadow-xl',
        'transition-all duration-300 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        
        // Brand colors with gradient
        'bg-gradient-to-br from-brand-red-45 to-brand-red-55 hover:from-brand-red-40 hover:to-brand-red-50',
        'text-white',
        'focus:ring-brand-red-55',
        
        // Animation states
        isOpen && 'rotate-45',
        
        // Responsive sizing
        'md:w-16 md:h-16',
        
        className
      )}
      aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
      aria-expanded={isOpen}
    >
      <div className="relative">
        {/* Message icon */}
        <MessageCircle 
          className={cn(
            'w-6 h-6 md:w-7 md:h-7 transition-all duration-200',
            isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
          )}
        />
        
        {/* Close icon */}
        <X 
          className={cn(
            'w-6 h-6 md:w-7 md:h-7 absolute inset-0 transition-all duration-200',
            isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          )}
        />
      </div>
      
      {/* Pulse animation when closed */}
      {!isOpen && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-red-45 to-brand-red-55 animate-ping opacity-20" />
      )}
    </button>
  );
}