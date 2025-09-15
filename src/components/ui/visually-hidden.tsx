import React from 'react';
import { cn } from '@/lib/utils';

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

/**
 * VisuallyHidden component hides content visually but keeps it accessible to screen readers
 */
export function VisuallyHidden({ children, className, ...props }: VisuallyHiddenProps) {
  return (
    <span
      className={cn(
        "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
        "clip-rect(0,0,0,0)", // For older browsers
        className
      )}
      style={{
        clip: 'rect(0, 0, 0, 0)',
        clipPath: 'inset(50%)',
      }}
      {...props}
    >
      {children}
    </span>
  );
}
