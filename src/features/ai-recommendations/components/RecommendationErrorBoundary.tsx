"use client";
import React from "react";
import { ErrorState } from "@/components/states";
import { AppErrorCode } from "@/utils/error-codes";
import { normalizeError } from "@/utils/normalize-error";

interface RecommendationErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorCode?: AppErrorCode;
}

interface RecommendationErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
  fallback?: React.ReactNode;
}

/**
 * Error boundary specifically for AI recommendations feature
 * Provides graceful error handling with appropriate fallbacks and retry mechanisms
 */
export class RecommendationErrorBoundary extends React.Component<
  RecommendationErrorBoundaryProps,
  RecommendationErrorBoundaryState
> {
  constructor(props: RecommendationErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCode: undefined,
    };
  }

  static getDerivedStateFromError(error: Error): RecommendationErrorBoundaryState {
    console.error("RecommendationErrorBoundary caught error:", error);
    
    // Normalize the error to get appropriate error code
    const normalizedError = normalizeError(error);
    
    return {
      hasError: true,
      error,
      errorCode: normalizedError.code,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for monitoring
    console.error("Recommendation error boundary details:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === "production") {
      // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  handleRetry = () => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorCode: undefined,
    });

    // Call parent retry handler if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Determine error message based on error code
      let title = "Unable to load recommendations";
      let message = "We're having trouble generating your personalized recommendations.";

      switch (this.state.errorCode) {
        case AppErrorCode.TMDB_API_ERROR:
          title = "Content Service Error";
          message = "Our content service is experiencing issues. We'll show popular content instead.";
          break;
        case AppErrorCode.INSUFFICIENT_USER_DATA:
          title = "Not Enough Data";
          message = "Add some movies or shows to your favorites to get personalized recommendations!";
          break;
        case AppErrorCode.NETWORK_ERROR:
          title = "Connection Issue";
          message = "Check your internet connection and try again.";
          break;
        case AppErrorCode.RECOMMENDATIONS_GENERATION_FAILED:
          title = "Recommendations Unavailable";
          message = "We couldn't generate recommendations right now. Please try again later.";
          break;
        default:
          // Use default messages
          break;
      }

      return (
        <ErrorState
          variant="card"
          title={title}
          message={message}
          onRetry={this.handleRetry}
          retryLabel="Try Again"
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Hook version of the error boundary for functional components
 * Note: This is a wrapper that uses the class-based error boundary
 */
export function useRecommendationErrorBoundary() {
  return {
    RecommendationErrorBoundary,
  };
}