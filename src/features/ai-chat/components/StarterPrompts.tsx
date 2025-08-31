'use client';

import { cn } from '@/lib/utils';
import { StarterPrompt } from '../types/chat';
import Image from 'next/image';

interface StarterPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  className?: string;
}

const starterPrompts: StarterPrompt[] = [
  {
    id: 'creative-1',
    category: 'creative',
    title: 'Hidden Gems',
    prompt: 'What are some underrated movies that deserve more attention?'
  },
  {
    id: 'creative-2',
    category: 'creative',
    title: 'TV Show Recommendations',
    prompt: 'Recommend shows similar to The Office'
  },
  {
    id: 'analytical-1',
    category: 'analytical',
    title: 'Scene Analysis',
    prompt: 'Can you analyze the cinematography in a famous movie scene?'
  },
  {
    id: 'analytical-2',
    category: 'analytical',
    title: 'Director Styles',
    prompt: 'Compare the directing styles of Christopher Nolan and Denis Villeneuve'
  },
  {
    id: 'analytical-3',
    category: 'analytical',
    title: 'TV Show Analysis',
    prompt: 'What is Breaking Bad about?'
  },
  {
    id: 'educational-1',
    category: 'educational',
    title: 'Film History',
    prompt: 'Tell me about the evolution of special effects in cinema'
  },
  {
    id: 'educational-2',
    category: 'educational',
    title: 'Genre Deep Dive',
    prompt: 'Explain the key characteristics of film noir movies'
  },
  {
    id: 'casual-1',
    category: 'casual',
    title: 'Quick Recommendations',
    prompt: 'I have 2 hours free tonight, what should I watch?'
  },
  {
    id: 'casual-2',
    category: 'casual',
    title: 'Mood-Based',
    prompt: 'I want something funny and uplifting to watch'
  },
  {
    id: 'casual-3',
    category: 'casual',
    title: 'Trending TV Shows',
    prompt: 'What TV shows are trending right now?'
  }
];

const categoryColors = {
  creative: 'hover:bg-brand-red-55/5',
  analytical: 'hover:bg-brand-blue-55/5',
  educational: 'hover:bg-brand-grey-70/5',
  casual: 'hover:bg-brand-red-70/5'
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
          return (
            <button
              key={prompt.id}
              onClick={() => onSelectPrompt(prompt.prompt)}
              className={cn(
                'relative group px-6 py-3.5 rounded-lg',
                'bg-brand-black-12 hover:bg-brand-black-15',
                'transition-all duration-200',
                'text-left focus:outline-none focus:ring-2 focus:ring-brand-red-55',
                categoryColors[prompt.category]
              )}
            >
              {/* Gradient border effect like Figma design */}
              <div 
                className="absolute inset-[-1px] pointer-events-none rounded-[9px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{
                  background: 'linear-gradient(135deg, #F42525 0%, #CE6476 20%, #B094B5 44%, #6DB8F8 75%, #54ACF6 84%, #3DA0F5 100%)',
                  maskComposite: 'subtract',
                  mask: 'linear-gradient(white 0 0) content-box, linear-gradient(white 0 0)',
                  WebkitMaskComposite: 'xor',
                  WebkitMask: 'linear-gradient(white 0 0) content-box, linear-gradient(white 0 0)'
                }}
              />
              
              <div className="flex items-center gap-3 relative">
                {/* Sparkles icon */}
                <div className="relative shrink-0 w-6 h-6">
                  <Image
                    src="/icons/sparkles.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="w-full h-full"
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold leading-[1.53] text-sm text-zinc-200 whitespace-pre-wrap">
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