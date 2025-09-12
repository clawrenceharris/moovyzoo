import React from "react";
import { cn } from "@/lib/utils";

/**
 * Available variants for state components
 */
export type StateVariant = "grid" | "list" | "inline" | "card" | "page";

/**
 * Props for the LoadingState component
 */
export interface LoadingStateProps {
  /** The layout variant to render - affects the skeleton structure and layout */
  variant?: StateVariant;
  /** Number of skeleton items to display */
  count?: number;
  /** Additional CSS classes to apply to the container */
  className?: string;
}

/**
 * LoadingState component provides consistent loading skeletons across different layouts.
 *
 * This component renders animated skeleton placeholders that match the expected content
 * structure for different UI contexts. It supports multiple variants optimized for
 * different use cases like grids, lists, inline content, and cards.
 *
 * @example
 * ```tsx
 * // Grid layout for habitat cards
 * <LoadingState variant="grid" count={6} />
 *
 * // List layout for discussions
 * <LoadingState variant="list" count={3} />
 *
 * // Inline loading for small components
 * <LoadingState variant="inline" count={4} />
 * ```
 *
 * @param props - The component props
 * @returns A loading skeleton component with animated placeholders
 */
export function LoadingState({
  variant = "grid",
  count = 6,
  className,
}: LoadingStateProps) {
  const renderGridItem = (index: number) => (
    <div
      key={index}
      className="media-card animate-pulse"
      data-testid="loading-card"
    >
      <div className="media-card-banner">
        <div className="w-full h-full bg-muted" />
      </div>
      <div className="card-content">
        <div>
          <div className="h-6 bg-white/20 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-white/20 rounded w-full mb-1"></div>
          <div className="h-4 bg-white/20 rounded w-2/3"></div>
        </div>
        <div className="card-footer">
          <div className="h-8 bg-white/20 rounded-full w-24"></div>
          <div className="h-10 bg-white/20 rounded-lg w-28"></div>
        </div>
      </div>
    </div>
  );

  const renderListItem = (index: number) => (
    <div
      key={index}
      className="p-4 border border-border rounded-lg animate-pulse"
      data-testid="loading-item"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="h-4 bg-muted rounded w-48"></div>
        <div className="h-3 bg-muted rounded w-12"></div>
      </div>
      <div className="h-3 bg-muted rounded w-full mb-2"></div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-muted rounded w-32"></div>
        <div className="h-3 bg-muted rounded w-20"></div>
      </div>
    </div>
  );

  const renderPageItem = (index: number) => (
    <div
      key={index}
      className="flex flex-col p-4 h-full flex-1 border border-border rounded-lg"
      data-testid="loading-item"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="h-4 bg-muted rounded w-48"></div>
        <div className="h-3 bg-muted rounded w-12"></div>
      </div>
      <div className="h-3 bg-muted rounded w-full mb-2"></div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-muted rounded w-32"></div>
        <div className="h-3 bg-muted rounded w-20"></div>
      </div>
    </div>
  );
  const renderInlineItem = (index: number) => (
    <div
      key={index}
      className="w-32 h-20 bg-muted rounded animate-pulse"
      data-testid="loading-item"
    />
  );

  const renderCardItem = (index: number) => (
    <div
      key={index}
      className="p-4 border border-border rounded-lg animate-pulse"
      data-testid="loading-item"
    >
      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-muted rounded w-full mb-1"></div>
      <div className="h-3 bg-muted rounded w-2/3"></div>
    </div>
  );

  const renderItem = (index: number) => {
    switch (variant) {
      case "grid":
        return renderGridItem(index);
      case "list":
        return renderListItem(index);
      case "inline":
        return renderInlineItem(index);
      case "card":
        return renderCardItem(index);
      case "page":
        return renderPageItem(index);
      default:
        return renderGridItem(index);
    }
  };

  return (
    <div
      className={cn("loading-state", `loading-state-${variant}`, className)}
      data-testid="loading-state"
    >
      {Array.from({ length: count }).map((_, index) => renderItem(index))}
    </div>
  );
}
