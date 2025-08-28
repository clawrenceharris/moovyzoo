import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  it("renders with default props", () => {
    render(<EmptyState />);

    const emptyState = screen.getByTestId("empty-state");
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveClass("empty-state", "empty-state-default");

    expect(screen.getByText("No items found")).toBeInTheDocument();
    expect(
      screen.getByText("There are no items to display at the moment.")
    ).toBeInTheDocument();
  });

  it("renders default variant correctly", () => {
    render(<EmptyState variant="default" />);

    const emptyState = screen.getByTestId("empty-state");
    expect(emptyState).toHaveClass("empty-state-default");

    // Should show default icon
    const icon = emptyState.querySelector("svg");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("w-12", "h-12", "text-muted-foreground");
  });

  it("renders minimal variant correctly", () => {
    render(<EmptyState variant="minimal" />);

    const emptyState = screen.getByTestId("empty-state");
    expect(emptyState).toHaveClass("empty-state-minimal");

    // Should show smaller icon
    const icon = emptyState.querySelector("svg");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("w-4", "h-4");
  });

  it("renders inline variant correctly", () => {
    render(<EmptyState variant="inline" />);

    const emptyState = screen.getByTestId("empty-state");
    expect(emptyState).toHaveClass("empty-state-inline");

    // Should have inline styling
    const container = emptyState.querySelector(".flex.items-center.gap-3");
    expect(container).toBeInTheDocument();
  });

  it("renders card variant correctly", () => {
    render(<EmptyState variant="card" />);

    const emptyState = screen.getByTestId("empty-state");
    expect(emptyState).toHaveClass("empty-state-card");

    // Should have card styling
    const card = emptyState.querySelector(".p-6.bg-card.border");
    expect(card).toBeInTheDocument();
  });

  it("renders custom title and description", () => {
    render(
      <EmptyState
        title="No Results"
        description="Try adjusting your search criteria"
      />
    );

    expect(screen.getByText("No Results")).toBeInTheDocument();
    expect(
      screen.getByText("Try adjusting your search criteria")
    ).toBeInTheDocument();
  });

  it("renders custom icon", () => {
    const customIcon = <div data-testid="custom-icon">Custom Icon</div>;
    render(<EmptyState icon={customIcon} />);

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(screen.getByText("Custom Icon")).toBeInTheDocument();
  });

  it("hides icon when showIcon is false", () => {
    render(<EmptyState showIcon={false} />);

    const emptyState = screen.getByTestId("empty-state");
    const icon = emptyState.querySelector("svg");
    expect(icon).not.toBeInTheDocument();
  });

  it("renders primary action button when onAction is provided", () => {
    const mockAction = vi.fn();
    render(<EmptyState onAction={mockAction} actionLabel="Create New" />);

    const actionButton = screen.getByRole("button", { name: "Create New" });
    expect(actionButton).toBeInTheDocument();
  });

  it("calls onAction when primary action button is clicked", () => {
    const mockAction = vi.fn();
    render(<EmptyState onAction={mockAction} actionLabel="Create New" />);

    const actionButton = screen.getByRole("button", { name: "Create New" });
    fireEvent.click(actionButton);

    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it("renders secondary action button when onSecondaryAction is provided", () => {
    const mockSecondaryAction = vi.fn();
    render(
      <EmptyState
        onSecondaryAction={mockSecondaryAction}
        secondaryActionLabel="Learn More"
      />
    );

    const secondaryButton = screen.getByRole("button", { name: "Learn More" });
    expect(secondaryButton).toBeInTheDocument();
  });

  it("calls onSecondaryAction when secondary action button is clicked", () => {
    const mockSecondaryAction = vi.fn();
    render(
      <EmptyState
        onSecondaryAction={mockSecondaryAction}
        secondaryActionLabel="Learn More"
      />
    );

    const secondaryButton = screen.getByRole("button", { name: "Learn More" });
    fireEvent.click(secondaryButton);

    expect(mockSecondaryAction).toHaveBeenCalledTimes(1);
  });

  it("renders both primary and secondary action buttons", () => {
    const mockAction = vi.fn();
    const mockSecondaryAction = vi.fn();
    render(
      <EmptyState
        onAction={mockAction}
        actionLabel="Create New"
        onSecondaryAction={mockSecondaryAction}
        secondaryActionLabel="Learn More"
      />
    );

    expect(
      screen.getByRole("button", { name: "Create New" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Learn More" })
    ).toBeInTheDocument();
  });

  it("does not render action buttons when no actions are provided", () => {
    render(<EmptyState />);

    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(0);
  });

  it("does not render action button when onAction is provided but actionLabel is missing", () => {
    const mockAction = vi.fn();
    render(<EmptyState onAction={mockAction} />);

    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(0);
  });

  it("applies custom className", () => {
    render(<EmptyState className="custom-empty-class" />);

    const emptyState = screen.getByTestId("empty-state");
    expect(emptyState).toHaveClass("custom-empty-class");
  });

  it("renders minimal variant with action button", () => {
    const mockAction = vi.fn();
    render(
      <EmptyState
        variant="minimal"
        onAction={mockAction}
        actionLabel="Add Item"
      />
    );

    const actionButton = screen.getByRole("button", { name: "Add Item" });
    expect(actionButton).toBeInTheDocument();
    expect(actionButton).toHaveClass("h-auto", "p-1", "text-xs");
  });

  it("renders inline variant with description", () => {
    render(
      <EmptyState
        variant="inline"
        title="No Messages"
        description="Start a conversation"
      />
    );

    expect(screen.getByText("No Messages")).toBeInTheDocument();
    expect(screen.getByText("Start a conversation")).toBeInTheDocument();
  });

  it("renders card variant without description", () => {
    render(<EmptyState variant="card" title="Empty" description="" />);

    expect(screen.getByText("Empty")).toBeInTheDocument();

    // Description should not be rendered when empty
    const emptyState = screen.getByTestId("empty-state");
    expect(emptyState).not.toHaveTextContent("There are no items");
  });

  it("handles multiple action clicks", () => {
    const mockAction = vi.fn();
    render(<EmptyState onAction={mockAction} actionLabel="Create" />);

    const actionButton = screen.getByRole("button", { name: "Create" });

    fireEvent.click(actionButton);
    fireEvent.click(actionButton);
    fireEvent.click(actionButton);

    expect(mockAction).toHaveBeenCalledTimes(3);
  });

  it("renders with all variants and maintains structure", () => {
    const variants = ["default", "minimal", "inline", "card"] as const;

    variants.forEach((variant) => {
      const { unmount } = render(<EmptyState variant={variant} />);

      const emptyState = screen.getByTestId("empty-state");
      expect(emptyState).toHaveClass(`empty-state-${variant}`);

      unmount();
    });
  });

  it("renders actions in correct order", () => {
    const mockAction = vi.fn();
    const mockSecondaryAction = vi.fn();
    render(
      <EmptyState
        onAction={mockAction}
        actionLabel="Primary"
        onSecondaryAction={mockSecondaryAction}
        secondaryActionLabel="Secondary"
      />
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent("Primary");
    expect(buttons[1]).toHaveTextContent("Secondary");
  });
});
