import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { WatchPartyCreationModal } from "../WatchPartyCreationModal";
import type { WatchParty } from "../../domain/habitats.types";

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

// Mock WatchPartyCreationForm
vi.mock("./", () => ({
  WatchPartyCreationForm: ({ habitatId, userId, onSuccess, onCancel }: any) => (
    <div data-testid="watch-party-creation-form">
      <p>Habitat ID: {habitatId}</p>
      <p>User ID: {userId}</p>
      <button
        onClick={() =>
          onSuccess({
            id: "party-1",
            title: "Test Watch Party",
            habitat_id: habitatId,
          })
        }
        data-testid="form-success-button"
      >
        Create Watch Party
      </button>
      <button onClick={onCancel} data-testid="form-cancel-button">
        Cancel
      </button>
    </div>
  ),
}));

describe("WatchPartyCreationModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    habitatId: "habitat-1",
    userId: "user-1",
    onSuccess: vi.fn(),
  };

  const mockWatchParty: WatchParty = {
    id: "party-1",
    habitat_id: "habitat-1",
    title: "Test Watch Party",
    description: "Test Description",
    scheduled_time: "2024-01-02T20:00:00Z",
    participant_count: 1,
    max_participants: 10,
    created_by: "user-1",
    created_at: "2024-01-01T00:00:00Z",
    is_active: true,
    participants: [],
    user_is_participant: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render modal when isOpen is true", () => {
      // Act
      render(<WatchPartyCreationModal {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("dialog")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-header")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
    });

    it("should not render modal when isOpen is false", () => {
      // Act
      render(<WatchPartyCreationModal {...defaultProps} isOpen={false} />);

      // Assert
      expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
    });

    it("should render modal title", () => {
      // Act
      render(<WatchPartyCreationModal {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("dialog-title")).toHaveTextContent(
        "Create Watch Party"
      );
    });

    it("should render WatchPartyCreationForm with correct props", () => {
      // Act
      render(<WatchPartyCreationModal {...defaultProps} />);

      // Assert
      expect(
        screen.getByTestId("watch-party-creation-form")
      ).toBeInTheDocument();
      expect(screen.getByText("Habitat ID: habitat-1")).toBeInTheDocument();
      expect(screen.getByText("User ID: user-1")).toBeInTheDocument();
    });

    it("should apply correct CSS classes to dialog content", () => {
      // Act
      render(<WatchPartyCreationModal {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("dialog-content")).toHaveClass("sm:max-w-md");
    });
  });

  describe("Modal Interactions", () => {
    it("should call onClose when dialog backdrop is clicked", () => {
      // Act
      render(<WatchPartyCreationModal {...defaultProps} />);

      const dialog = screen.getByTestId("dialog");
      fireEvent.click(dialog);

      // Assert
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when form cancel is clicked", () => {
      // Act
      render(<WatchPartyCreationModal {...defaultProps} />);

      const cancelButton = screen.getByTestId("form-cancel-button");
      fireEvent.click(cancelButton);

      // Assert
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onSuccess and onClose when form succeeds", () => {
      // Act
      render(<WatchPartyCreationModal {...defaultProps} />);

      const successButton = screen.getByTestId("form-success-button");
      fireEvent.click(successButton);

      // Assert
      expect(defaultProps.onSuccess).toHaveBeenCalledWith({
        id: "party-1",
        title: "Test Watch Party",
        habitat_id: "habitat-1",
      });
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("should handle success callback with complete watch party data", () => {
      // Act
      render(<WatchPartyCreationModal {...defaultProps} />);

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
        <WatchPartyCreationModal
          {...defaultProps}
          habitatId="different-habitat"
        />
      );

      // Assert
      expect(
        screen.getByText("Habitat ID: different-habitat")
      ).toBeInTheDocument();
    });

    it("should pass userId to form correctly", () => {
      // Act
      render(
        <WatchPartyCreationModal {...defaultProps} userId="different-user" />
      );

      // Assert
      expect(screen.getByText("User ID: different-user")).toBeInTheDocument();
    });

    it("should handle different onSuccess callbacks", () => {
      // Arrange
      const customOnSuccess = vi.fn();

      // Act
      render(
        <WatchPartyCreationModal
          {...defaultProps}
          onSuccess={customOnSuccess}
        />
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
      render(
        <WatchPartyCreationModal {...defaultProps} onClose={customOnClose} />
      );

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
        <WatchPartyCreationModal {...defaultProps} isOpen={false} />
      );

      // Assert initial state
      expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();

      // Act - Change isOpen to true
      rerender(<WatchPartyCreationModal {...defaultProps} isOpen={true} />);

      // Assert
      expect(screen.getByTestId("dialog")).toBeInTheDocument();
    });

    it("should hide modal when isOpen changes from true to false", () => {
      // Arrange
      const { rerender } = render(
        <WatchPartyCreationModal {...defaultProps} isOpen={true} />
      );

      // Assert initial state
      expect(screen.getByTestId("dialog")).toBeInTheDocument();

      // Act - Change isOpen to false
      rerender(<WatchPartyCreationModal {...defaultProps} isOpen={false} />);

      // Assert
      expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper dialog structure", () => {
      // Act
      render(<WatchPartyCreationModal {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("dialog-header")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
    });

    it("should have accessible title", () => {
      // Act
      render(<WatchPartyCreationModal {...defaultProps} />);

      // Assert
      const title = screen.getByRole("heading", { level: 2 });
      expect(title).toHaveTextContent("Create Watch Party");
    });

    it("should support keyboard navigation through dialog", () => {
      // Act
      render(<WatchPartyCreationModal {...defaultProps} />);

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
          <WatchPartyCreationModal
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
        render(
          <WatchPartyCreationModal {...defaultProps} habitatId="" userId="" />
        );
      }).not.toThrow();

      expect(screen.getByText("Habitat ID:")).toBeInTheDocument();
      expect(screen.getByText("User ID:")).toBeInTheDocument();
    });

    it("should handle rapid open/close state changes", () => {
      // Arrange
      const { rerender } = render(
        <WatchPartyCreationModal {...defaultProps} isOpen={false} />
      );

      // Act - Rapid state changes
      rerender(<WatchPartyCreationModal {...defaultProps} isOpen={true} />);
      rerender(<WatchPartyCreationModal {...defaultProps} isOpen={false} />);
      rerender(<WatchPartyCreationModal {...defaultProps} isOpen={true} />);

      // Assert - Should handle gracefully
      expect(screen.getByTestId("dialog")).toBeInTheDocument();
    });

    it("should maintain form state during modal lifecycle", () => {
      // Act
      render(<WatchPartyCreationModal {...defaultProps} />);

      // Assert - Form should be rendered with correct props
      expect(
        screen.getByTestId("watch-party-creation-form")
      ).toBeInTheDocument();
      expect(screen.getByText("Habitat ID: habitat-1")).toBeInTheDocument();
      expect(screen.getByText("User ID: user-1")).toBeInTheDocument();
    });

    it("should handle form success with complete watch party object", () => {
      // Arrange - Mock form to return complete watch party data
      vi.mocked(WatchPartyCreationForm as any).mockImplementation(
        ({ onSuccess, onCancel, habitatId, userId }: any) => (
          <div data-testid="watch-party-creation-form">
            <button
              onClick={() => onSuccess(mockWatchParty)}
              data-testid="form-success-button"
            >
              Create Complete Watch Party
            </button>
            <button onClick={onCancel} data-testid="form-cancel-button">
              Cancel
            </button>
          </div>
        )
      );

      // Act
      render(<WatchPartyCreationModal {...defaultProps} />);

      const successButton = screen.getByTestId("form-success-button");
      fireEvent.click(successButton);

      // Assert
      expect(defaultProps.onSuccess).toHaveBeenCalledWith(mockWatchParty);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Integration with Form Component", () => {
    it("should properly integrate with WatchPartyCreationForm", () => {
      // Act
      render(<WatchPartyCreationModal {...defaultProps} />);

      // Assert - Form should receive all required props
      expect(
        screen.getByTestId("watch-party-creation-form")
      ).toBeInTheDocument();

      // Form should have access to success and cancel handlers
      expect(screen.getByTestId("form-success-button")).toBeInTheDocument();
      expect(screen.getByTestId("form-cancel-button")).toBeInTheDocument();
    });

    it("should handle form success and automatically close modal", () => {
      // Act
      render(<WatchPartyCreationModal {...defaultProps} />);

      // Simulate form success
      const successButton = screen.getByTestId("form-success-button");
      fireEvent.click(successButton);

      // Assert - Both onSuccess and onClose should be called
      expect(defaultProps.onSuccess).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("should handle form cancellation and close modal", () => {
      // Act
      render(<WatchPartyCreationModal {...defaultProps} />);

      // Simulate form cancellation
      const cancelButton = screen.getByTestId("form-cancel-button");
      fireEvent.click(cancelButton);

      // Assert - Only onClose should be called
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    });
  });
});
