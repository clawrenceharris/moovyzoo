import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ConnectionStatus } from "../ConnectionStatus";

describe("ConnectionStatus", () => {
  it("should show connected status when connected", () => {
    render(<ConnectionStatus connected={true} />);

    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveClass("bg-green-500/10");
  });

  it("should show connecting status when connecting", () => {
    render(<ConnectionStatus connected={false} connecting={true} />);

    expect(screen.getByText("Connecting...")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveClass("bg-yellow-500/10");
  });

  it("should show disconnected status when not connected", () => {
    render(<ConnectionStatus connected={false} connecting={false} />);

    expect(screen.getByText("Offline")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveClass("bg-red-500/10");
  });

  it("should show error message when provided", () => {
    render(
      <ConnectionStatus
        connected={false}
        connecting={false}
        error="Connection failed"
      />
    );

    expect(screen.getByText("Connection failed")).toBeInTheDocument();
  });

  it("should show retry button when onRetry is provided", () => {
    const mockRetry = vi.fn();
    render(
      <ConnectionStatus
        connected={false}
        connecting={false}
        onRetry={mockRetry}
      />
    );

    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it("should call onRetry when retry button is clicked", () => {
    const mockRetry = vi.fn();
    render(
      <ConnectionStatus
        connected={false}
        connecting={false}
        onRetry={mockRetry}
      />
    );

    const retryButton = screen.getByRole("button", { name: /retry/i });
    retryButton.click();

    expect(mockRetry).toHaveBeenCalledOnce();
  });

  it("should be compact when compact prop is true", () => {
    render(<ConnectionStatus connected={true} compact={true} />);

    // Should only show the status indicator, not the text
    expect(screen.queryByText("Live")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
