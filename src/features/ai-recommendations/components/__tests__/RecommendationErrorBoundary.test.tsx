import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RecommendationErrorBoundary } from '../RecommendationErrorBoundary';

// Mock the ErrorState component
vi.mock('@/components/states', () => ({
  ErrorState: ({ title, message, onRetry }: any) => (
    <div data-testid="error-state">
      <h1>{title}</h1>
      <p>{message}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}));

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('RecommendationErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <RecommendationErrorBoundary>
        <ThrowError shouldThrow={false} />
      </RecommendationErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error state when child component throws', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <RecommendationErrorBoundary>
        <ThrowError shouldThrow={true} />
      </RecommendationErrorBoundary>
    );

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Unable to load recommendations')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should call onRetry when retry button is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onRetry = vi.fn();

    render(
      <RecommendationErrorBoundary onRetry={onRetry}>
        <ThrowError shouldThrow={true} />
      </RecommendationErrorBoundary>
    );

    const retryButton = screen.getByText('Retry');
    retryButton.click();

    expect(onRetry).toHaveBeenCalledOnce();

    consoleSpy.mockRestore();
  });

  it('should render custom fallback when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const customFallback = <div data-testid="custom-fallback">Custom error</div>;

    render(
      <RecommendationErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </RecommendationErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom error')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});