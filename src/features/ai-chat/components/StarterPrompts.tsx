'use client';

import { Film, Lightbulb, BookOpen, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StarterPrompt } from '../types/chat';

interface StarterPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  className?: string;
}

const starterPrompts: StarterPrompt[] = [
  {
    id: 'creative-1',
    category: 'creative',
    title: 'Movie Night Ideas',
    prompt: 'Suggest some great movies for a cozy movie night with friends',
    icon: '🍿'
  },
  {
    id: 'creative-2',
    category: 'creative',
    title: 'Hidden Gems',
    prompt: 'What are some underrated movies that deserve more attention?',
    icon: '💎'
  },
  {
    id: 'analytical-1',
    category: 'analytical',
    title: 'Scene Analysis',
    prompt: 'Can you analyze the cinematography in a famous movie scene?',
    icon: '🎬'
  },
  {
    id: 'analytical-2',
    category: 'analytical',
    title: 'Director Styles',
    prompt: 'Compare the directing styles of Christopher Nolan and Denis Villeneuve',
    icon: '🎭'
  },
  {
    id: 'educational-1',
    category: 'educational',
    title: 'Film History',
    prompt: 'Tell me about the evolution of special effects in cinema',
    icon: '📚'
  },
  {
    id: 'educational-2',
    category: 'educational',
    title: 'Genre Deep Dive',
    prompt: 'Explain the key characteristics of film noir movies',
    icon: '🔍'
  },
  {
    id: 'casual-1',
    category: 'casual',
    title: 'Quick Recommendations',
    prompt: 'I have 2 hours free tonight, what should I watch?',
    icon: '⏰'
  },
  {
    id: 'casual-2',
    category: 'casual',
    title: 'Mood-Based',
    prompt: 'I want something funny and uplifting to watch',
    icon: '😊'
  }
];

const categoryIcons = {
  creative: Film,
  analytical: Lightbulb,
  educational: BookOpen,
  casual: Coffee
};

const categoryColors = {
  creative: 'border-brand-red-55 hover:bg-brand-red-55/10',
  analytical: 'border-brand-blue-55 hover:bg-brand-blue-55/10',
  educational: 'border-brand-grey-70 hover:bg-brand-grey-70/10',
  casual: 'border-brand-red-70 hover:bg-brand-red-70/10'
};

export function StarterPrompts({ onSelectPrompt, className }: StarterPromptsProps) {
  return (
    <div className={cn('p-6', className)}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          Get started with these prompts
        </h3>
        <p className="text-sm text-brand-grey-70">
          Click any prompt below to begin your conversation
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {starterPrompts.map((prompt) => {
          const IconComponent = categoryIcons[prompt.category];
          
          return (
            <button
              key={prompt.id}
              onClick={() => onSelectPrompt(prompt.prompt)}
              className={cn(
                'group p-4 rounded-xl border-2 border-transparent',
                'bg-brand-black-12 hover:bg-brand-black-15',
                'transition-all duration-200',
                'text-left focus:outline-none focus:ring-2 focus:ring-brand-red-55',
                categoryColors[prompt.category]
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-brand-black-20 flex items-center justify-center">
                    <span className="text-lg">{prompt.icon}</span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className="w-4 h-4 text-brand-grey-70" />
                    <h4 className="font-medium text-white text-sm">
                      {prompt.title}
                    </h4>
                  </div>
                  <p className="text-sm text-brand-grey-70 group-hover:text-white transition-colors">
                    {prompt.prompt}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}