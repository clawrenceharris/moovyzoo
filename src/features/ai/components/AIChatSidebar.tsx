'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ChatInterface } from './ChatInterface';

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatSidebar({ isOpen, onClose }: AIChatSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      // Add a small delay to prevent immediate closing when opening
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop overlay */}
      <div 
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-sm',
          'transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Sidebar container */}
      <div
        ref={sidebarRef}
        className={cn(
          'absolute right-0 top-0 h-full',
          'bg-[--brand-black-08] border-l border-[--brand-black-15]',
          'shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          
          // Desktop: fixed width sidebar
          'hidden md:flex md:w-[400px]',
          isOpen ? 'md:translate-x-0' : 'md:translate-x-full',
          
          // Mobile: full screen
          'flex md:hidden w-full',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="flex flex-col w-full h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[--brand-black-15]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[--brand-red-45] flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">MoovyZoo AI</h2>
                <p className="text-sm text-[--brand-grey-70]">Your movie companion</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className={cn(
                'p-2 rounded-lg',
                'text-[--brand-grey-70] hover:text-white',
                'hover:bg-[--brand-black-15]',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-[--brand-red-55]'
              )}
              aria-label="Close AI chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat interface */}
          <div className="flex-1 overflow-hidden">
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
}