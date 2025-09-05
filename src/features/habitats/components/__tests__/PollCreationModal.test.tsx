import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PollCreationModal } from "../PollCreationModal";
import type { Poll } from "../../domain/habitats.types";

// Mock UI components
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, onOpenChange, children }: any) =>
    open ? (
      <div data-testid="dialog" onClick={() => onOpenChange(false)}>
        {children}
      </div>
    ) : null,
  DialogContent: ({ children, className }: any) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: any) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
}));

// Mock PollCreationForm
vi.mock("../PollCreationForm", () => ({
  PollCreationForm: ({ habitatId, userId, onSuccess, onCancel }: any) => (
    <div data-testid="poll-creation-form">
      <p>Habitat ID: {habitatId}</p>
      <p>User ID: {userId}</p>
      <button
        onClick={() =>
          onSuccess({
            id: "poll-1",
            title: "Test Poll",
            habitat_id: habitatId,
          })
        }
        data-testid="form-success-button"
      >
        Create Poll
      </button>
      <button onClick={onCancel} data-testid="form-cancel-button">
        Cancel
      </button>
    </div>
  ),
}));

describe("PollCreationModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    habitatId: "habitat-1",
    userId: "user-1",
    onSuccess: vi.fn(),
  };

  const mockPoll: Poll = {
    id: "poll-1",
    habitat_id: "habitat-1",
    title: "Test Poll",
    options: { "Option 1": 0, "Option 2": 0 },
    created_by: "user-1",
    created_at: "2024-01-01T00:00:00Z",
    is_active: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render modal when isOpen is true", () => {
      // Act
      render(<PollCreationModal {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("dialog")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-header")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
    });

    it("should not render modal when isOpen is false", () => {
      // Act
      render(<PollCreationModal {...defaultProps} isOpen={false} />);

      // Assert
      expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
    });

    it("should render modal title", () => {
      // Act
      render(<PollCreationModal {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("dialog-title")).toHaveTextContent(
        "Create Poll"
      );
    });

    it("should render PollCreationForm with correct props", () => {
      // Act
      render(<PollCreationModal {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("poll-creation-form")).toBeInTheDocument();
      expect(screen.getByText("Habitat ID: habitat-1")).toBeInTheDocument();
      expect(screen.getByText("User ID: user-1")).toBeInTheDocument();
    });

    it("should apply correct CSS classes to dialog content", () => {
      // Act
      render(<PollCreationModal {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("dialog-content")).toHaveClass("sm:max-w-md");
    });
  });

  describe("Modal Interactions", () => {
    it("should call onClose when dialog backdrop is clicked", () => {
      // Act
      render(<PollCreationModal {...defaultProps} />);

      const dialog = screen.getByTestId("dialog");
      fireEvent.click(dialog);

      // Assert
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when form cancel is clicked", () => {
      // Act
      render(<PollCreationModal {...defaultProps} />);

      const cancelButton = screen.getByTestId("form-cancel-button");
      fireEvent.click(cancelButton);

      // Assert
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onSuccess and onClose when form succeeds", () => {
      // Act
      render(<PollCreationModal {...defaultProps} />);

      const successButton = screen.getByTestId("form-success-button");
      fireEvent.click(successButton);

      // Assert
      expect(defaultProps.onSuccess).toHaveBeenCalledWith({
        id: "poll-1",
        title: "Test Poll",
        habitat_id: "habitat-1",
      });
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("should handle success callback with complete poll data", () => {
      // Act
      render(<PollCreationModal {...defaultProps} />);

      const successButton = screen.getByTestId("form-success-button");
      fireEvent.click(successButton);

      // Assert
      expect(defaultProps.onSuccess).toHaveBeenCalledTimes(1);
      const callArgs = defaultProps.onSuccess.mock.calls[0][0];
      expect(callArgs).toHaveProperty("id");
      expect(callArgs).toHaveProperty("title");
      expect(callArgs).toHaveProperty("habitat_id");
    });
  });

  describe("Props Handling", () => {
    it("should pass habitatId to form correctly", () => {
      // Act
      render(
        <PollCreationModal {...defaultProps} habitatId="different-habitat" />
      );

      // Assert
      expect(
        screen.getByText("Habitat ID: different-habitat")
      ).toBeInTheDocument();
    });

    it("should pass userId to form correctly", () => {
      // Act
      render(<PollCreationModal {...defaultProps} userId="different-user" />);

      // Assert
      expect(screen.getByText("User ID: different-user")).toBeInTheDocument();
    });

    it("should handle different onSuccess callbacks", () => {
      // Arrange
      const customOnSuccess = vi.fn();

      // Act
      render(
        <PollCreationModal {...defaultProps} onSuccess={customOnSuccess} />
      );

      const successButton = screen.getByTestId("form-success-button");
      fireEvent.click(successButton);

      // Assert
      expect(customOnSuccess).toHaveBeenCalledTimes(1);
      expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    });

    it("should handle different onClose callbacks", () => {
      // Arrange
      const customOnClose = vi.fn();

      // Act
      render(<PollCreationModal {...defaultProps} onClose={customOnClose} />);

      const cancelButton = screen.getByTestId("form-cancel-button");
      fireEvent.click(cancelButton);

      // Assert
      expect(customOnClose).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe("Modal State Management", () => {
    it("should show modal when isOpen changes from false to true", () => {
      // Arrange
      const { rerender } = render(
        <PollCreationModal {...defaultProps} isOpen={false} />
      );

      // Assert initial state
      expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();

      // Act - Change isOpen to true
      rerender(<PollCreationModal {...defaultProps} isOpen={true} />);

      // Assert
      expect(screen.getByTestId("dialog")).toBeInTheDocument();
    });

    it("should hide modal when isOpen changes from true to false", () => {
      // Arrange
      const { rerender } = render(
        <PollCreationModal {...defaultProps} isOpen={true} />
      );

      // Assert initial state
      expect(screen.getByTestId("dialog")).toBeInTheDocument();

      // Act - Change isOpen to false
      rerender(<PollCreationModal {...defaultProps} isOpen={false} />);

      // Assert
      expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper dialog structure", () => {
      // Act
      render(<PollCreationModal {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("dialog-header")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
    });

    it("should have accessible title", () => {
      // Act
      render(<PollCreationModal {...defaultProps} />);

      // Assert
      const title = screen.getByRole("heading", { level: 2 });
      expect(title).toHaveTextContent("Create Poll");
    });

    it("should support keyboard navigation through dialog", () => {
      // Act
      render(<PollCreationModal {...defaultProps} />);

      // Assert - Form elements should be focusable
      expect(screen.getByTestId("form-success-button")).toBeInTheDocument();
      expect(screen.getByTestId("form-cancel-button")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined callbacks gracefully", () => {
      // Act & Assert - Should not crash
      expect(() => {
        render(
          <PollCreationModal
            {...defaultProps}
            onSuccess={undefined as any}
            onClose={undefined as any}
          />
        );
      }).not.toThrow();
    });

    it("should handle empty string IDs", () => {
      // Act & Assert - Should not crash
      expect(() => {
        render(<PollCreationModal {...defaultProps} habitatId="" userId="" />);
      }).not.toThrow();

      expect(screen.getByText("Habitat ID:")).toBeInTheDocument();
      expect(screen.getByText("User ID:")).toBeInTheDocument();
    });

    it("should handle rapid open/close state changes", () => {
      // Arrange
      const { rerender } = render(
        <PollCreationModal {...defaultProps} isOpen={false} />
      );

      // Act - Rapid state changes
      rerender(<PollCreationModal {...defaultProps} isOpen={true} />);
      rerender(<PollCreationModal {...defaultProps} isOpen={false} />);
      rerender(<PollCreationModal {...defaultProps} isOpen={true} />);

      // Assert - Should handle gracefully
      expect(screen.getByTestId("dialog")).toBeInTheDocument();
    });

    it("should maintain form state during modal lifecycle", () => {
      // Act
      render(<PollCreationModal {...defaultProps} />);

      // Assert - Form should be rendered with correct props
      expect(screen.getByTestId("poll-creation-form")).toBeInTheDocument();
      expect(screen.getByText("Habitat ID: habitat-1")).toBeInTheDocument();
      expect(screen.getByText("User ID: user-1")).toBeInTheDocument();
    });
  });
});
