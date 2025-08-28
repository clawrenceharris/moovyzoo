import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ErrorState } from "../ErrorState";

describe("ErrorState", () => {
  it("renders with default props", () => {
    render(<ErrorState />);

    const errorState = screen.getByTestId("error-state");
    expect(errorState).toBeInTheDocument();
    expect(errorState).toHaveClass("error-state", "error-state-default");

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText(
        "We encountered an error while loading this content. Please try again."
      )
    ).toBeInTheDocument();
  });

  it("renders default variant correctly", () => {
    render(<ErrorState variant="default" />);

    const errorState = screen.getByTestId("error-state");
    expect(errorState).toHaveClass("error-state-default");

    // Should show default icon
    const icon = errorState.querySelector("svg");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("w-12", "h-12", "text-destructive");
  });

  it("renders minimal variant correctly", () => {
    render(<ErrorState variant="minimal" />);

    const errorState = screen.getByTestId("error-state");
    expect(errorState).toHaveClass("error-state-minimal");

    // Should show smaller icon
    const icon = errorState.querySelector("svg");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("w-4", "h-4");
  });

  it("renders inline variant correctly", () => {
    render(<ErrorState variant="inline" />);

    const errorState = screen.getByTestId("error-state");
    expect(errorState).toHaveClass("error-state-inline");

    // Should have inline styling
    const container = errorState.querySelector(".flex.items-center.gap-3");
    expect(container).toBeInTheDocument();
  });

  it("renders card variant correctly", () => {
    render(<ErrorState variant="card" />);

    const errorState = screen.getByTestId("error-state");
    expect(errorState).toHaveClass("error-state-card");

    // Should have card styling
    const card = errorState.querySelector(".p-6.bg-card.border");
    expect(card).toBeInTheDocument();
  });

  it("renders custom title and message", () => {
    render(
      <ErrorState
        title="Custom Error"
        message="This is a custom error message"
      />
    );

    expect(screen.getByText("Custom Error")).toBeInTheDocument();
    expect(
      screen.getByText("This is a custom error message")
    ).toBeInTheDocument();
  });

  it("renders custom icon", () => {
    const customIcon = <div data-testid="custom-icon">Custom Icon</div>;
    render(<ErrorState icon={customIcon} />);

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(screen.getByText("Custom Icon")).toBeInTheDocument();
  });

  it("hides icon when showIcon is false", () => {
    render(<ErrorState showIcon={false} />);

    const errorState = screen.getByTestId("error-state");
    const icon = errorState.querySelector("svg");
    expect(icon).not.toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", () => {
    const mockRetry = vi.fn();
    render(<ErrorState onRetry={mockRetry} />);

    const retryButton = screen.getByRole("button", { name: "Try Again" });
    expect(retryButton).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", () => {
    const mockRetry = vi.fn();
    render(<ErrorState onRetry={mockRetry} />);

    const retryButton = screen.getByRole("button", { name: "Try Again" });
    fireEvent.click(retryButton);

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it("renders custom retry label", () => {
    const mockRetry = vi.fn();
    render(<ErrorState onRetry={mockRetry} retryLabel="Reload" />);

    const retryButton = screen.getByRole("button", { name: "Reload" });
    expect(retryButton).toBeInTheDocument();
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(<ErrorState />);

    const retryButton = screen.queryByRole("button");
    expect(retryButton).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<ErrorState className="custom-error-class" />);

    const errorState = screen.getByTestId("error-state");
    expect(errorState).toHaveClass("custom-error-class");
  });

  it("renders minimal variant with retry button", () => {
    const mockRetry = vi.fn();
    render(<ErrorState variant="minimal" onRetry={mockRetry} />);

    const retryButton = screen.getByRole("button", { name: "Try Again" });
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveClass("h-auto", "p-1", "text-xs");
  });

  it("renders inline variant with message", () => {
    render(
      <ErrorState
        variant="inline"
        title="Network Error"
        message="Check your connection"
      />
    );

    expect(screen.getByText("Network Error")).toBeInTheDocument();
    expect(screen.getByText("Check your connection")).toBeInTheDocument();
  });

  it("renders card variant without message", () => {
    render(<ErrorState variant="card" title="Error" message="" />);

    expect(screen.getByText("Error")).toBeInTheDocument();

    // Message should not be rendered when empty
    const errorState = screen.getByTestId("error-state");
    expect(errorState).not.toHaveTextContent("We encountered an error");
  });

  it("handles multiple retry clicks", () => {
    const mockRetry = vi.fn();
    render(<ErrorState onRetry={mockRetry} />);

    const retryButton = screen.getByRole("button", { name: "Try Again" });

    fireEvent.click(retryButton);
    fireEvent.click(retryButton);
    fireEvent.click(retryButton);

    expect(mockRetry).toHaveBeenCalledTimes(3);
  });

  it("renders with all variants and maintains structure", () => {
    const variants = ["default", "minimal", "inline", "card"] as const;

    variants.forEach((variant) => {
      const { unmount } = render(<ErrorState variant={variant} />);

      const errorState = screen.getByTestId("error-state");
      expect(errorState).toHaveClass(`error-state-${variant}`);

      unmount();
    });
  });
});
