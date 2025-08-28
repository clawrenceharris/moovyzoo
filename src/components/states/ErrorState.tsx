import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Available variants for error display
 */
export type ErrorVariant = "default" | "minimal" | "card" | "inline";

/**
 * Props for the ErrorState component
 */
export interface ErrorStateProps {
  /** The display variant - affects layout and styling */
  variant?: ErrorVariant;
  /** The error title/heading */
  title?: string;
  /** Detailed error message */
  message?: string;
  /** Custom icon to display (overrides default) */
  icon?: React.ReactNode;
  /** Callback function for retry action */
  onRetry?: () => void;
  /** Text for the retry button */
  retryLabel?: string;
  /** Additional CSS classes to apply */
  className?: string;
  /** Whether to show the error icon */
  showIcon?: boolean;
}

/**
 * ErrorState component provides consistent error display with retry functionality.
 *
 * This component handles different error scenarios with appropriate visual feedback
 * and user actions. It supports multiple variants for different UI contexts and
 * provides customizable retry mechanisms.
 *
 * @example
 * ```tsx
 * // Default error state with retry
 * <ErrorState
 *   title="Failed to load habitats"
 *   message="Check your connection and try again"
 *   onRetry={handleRetry}
 * />
 *
 * // Minimal inline error
 * <ErrorState
 *   variant="minimal"
 *   title="Upload failed"
 *   onRetry={handleRetry}
 * />
 *
 * // Card-style error with custom icon
 * <ErrorState
 *   variant="card"
 *   title="Network Error"
 *   icon={<NetworkIcon />}
 * />
 * ```
 *
 * @param props - The component props
 * @returns An error display component with optional retry functionality
 */
export function ErrorState({
  variant = "default",
  title = "Something went wrong",
  message = "We encountered an error while loading this content. Please try again.",
  icon,
  onRetry,
  retryLabel = "Try Again",
  className,
  showIcon = true,
}: ErrorStateProps) {
  const defaultIcon = (
    <svg
      className="w-12 h-12 text-destructive"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
  );

  const renderMinimal = () => (
    <div
      className={cn("error-state", "error-state-minimal", className)}
      data-testid="error-state"
    >
      <div className="flex items-center gap-2 text-destructive">
        {showIcon &&
          (icon || (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ))}
        <span className="text-sm font-medium">{title}</span>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-auto p-1 text-xs"
          >
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );

  const renderInline = () => (
    <div
      className={cn("error-state", "error-state-inline", className)}
      data-testid="error-state"
    >
      <div className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
        {showIcon &&
          (icon || (
            <svg
              className="w-5 h-5 text-destructive flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01"
              />
            </svg>
          ))}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-destructive">{title}</p>
          {message && (
            <p className="text-xs text-muted-foreground mt-1">{message}</p>
          )}
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="flex-shrink-0"
          >
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );

  const renderCard = () => (
    <div
      className={cn("error-state", "error-state-card", className)}
      data-testid="error-state"
    >
      <div className="p-6 bg-card border border-border rounded-lg text-center">
        {showIcon && (
          <div className="flex justify-center mb-4">{icon || defaultIcon}</div>
        )}
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        {message && (
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            {message}
          </p>
        )}
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );

  const renderDefault = () => (
    <div
      className={cn("error-state", "error-state-default", className)}
      data-testid="error-state"
    >
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        {showIcon && <div className="mb-4">{icon || defaultIcon}</div>}
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
        {message && (
          <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
        )}
        {onRetry && (
          <Button onClick={onRetry} variant="default">
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case "minimal":
        return renderMinimal();
      case "inline":
        return renderInline();
      case "card":
        return renderCard();
      case "default":
      default:
        return renderDefault();
    }
  };

  return renderVariant();
}
