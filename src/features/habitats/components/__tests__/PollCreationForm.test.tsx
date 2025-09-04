import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PollCreationForm } from "../PollCreationForm";
import { habitatsService } from "../../domain/habitats.service";
import { normalizeError } from "@/utils/normalize-error";

// Mock dependencies
vi.mock("../../domain/habitats.service", () => ({
  habitatsService: {
    createPoll: vi.fn(),
  },
}));

vi.mock("@/utils/normalize-error", () => ({
  normalizeError: vi.fn(),
}));

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    type,
    variant,
    size,
    className,
  }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      data-variant={variant}
      data-size={size}
      className={className}
      data-testid={`button-${children
        ?.toString()
        .toLowerCase()
        .replace(/\s+/g, "-")}`}
    >
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({
    value,
    onChange,
    placeholder,
    className,
    disabled,
    maxLength,
    type,
    id,
  }: any) => (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      maxLength={maxLength}
      data-testid={`input-${
        id || placeholder?.toLowerCase().replace(/\s+/g, "-")
      }`}
    />
  ),
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor} data-testid="label">
      {children}
    </label>
  ),
}));

describe("PollCreationForm", () => {
  const defaultProps = {
    habitatId: "habitat-1",
    userId: "user-1",
    onSuccess: vi.fn(),
    onCancel: vi.fn(),
  };

  const mockPoll = {
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
    it("should render poll title input", () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("input-poll-title")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter poll title")
      ).toBeInTheDocument();
    });

    it("should render initial two option inputs", () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      // Assert
      expect(screen.getByPlaceholderText("Option 1")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Option 2")).toBeInTheDocument();
    });

    it("should render form labels", () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      // Assert
      const labels = screen.getAllByTestId("label");
      expect(labels[0]).toHaveTextContent("Poll Title *");
      expect(labels[1]).toHaveTextContent("Poll Options *");
    });

    it("should render add option button", () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("button-add-option")).toBeInTheDocument();
    });

    it("should render form action buttons", () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("button-cancel")).toBeInTheDocument();
      expect(screen.getByTestId("button-create-poll")).toBeInTheDocument();
    });

    it("should display character count for title", () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      // Assert
      expect(screen.getByText("0/200 characters")).toBeInTheDocument();
    });

    it("should display option count", () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      // Assert
      expect(screen.getByText("0/6 options")).toBeInTheDocument();
    });
  });

  describe("Form Interactions", () => {
    it("should update title input and character count", () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      const titleInput = screen.getByTestId("input-poll-title");
      fireEvent.change(titleInput, { target: { value: "Test Poll Title" } });

      // Assert
      expect(titleInput).toHaveValue("Test Poll Title");
      expect(screen.getByText("15/200 characters")).toBeInTheDocument();
    });

    it("should update option inputs", () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      const option1Input = screen.getByPlaceholderText("Option 1");
      const option2Input = screen.getByPlaceholderText("Option 2");

      fireEvent.change(option1Input, { target: { value: "First Option" } });
      fireEvent.change(option2Input, { target: { value: "Second Option" } });

      // Assert
      expect(option1Input).toHaveValue("First Option");
      expect(option2Input).toHaveValue("Second Option");
      expect(screen.getByText("2/6 options")).toBeInTheDocument();
    });

    it("should add new option when add button is clicked", () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      const addButton = screen.getByTestId("button-add-option");
      fireEvent.click(addButton);

      // Assert
      expect(screen.getByPlaceholderText("Option 3")).toBeInTheDocument();
    });

    it("should remove option when remove button is clicked", () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      // Add a third option first
      const addButton = screen.getByTestId("button-add-option");
      fireEvent.click(addButton);

      // Now remove the third option
      const removeButtons = screen.getAllByRole("button");
      const removeButton = removeButtons.find(
        (btn) =>
          btn.querySelector("svg") &&
          btn.getAttribute("data-testid")?.includes("button")
      );

      if (removeButton) {
        fireEvent.click(removeButton);
      }

      // Assert
      expect(screen.queryByPlaceholderText("Option 3")).not.toBeInTheDocument();
    });

    it("should not allow removing options when only 2 remain", () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      // Assert - Remove buttons should not be present with only 2 options
      const removeButtons = screen
        .queryAllByRole("button")
        .filter((btn) => btn.querySelector("svg"));
      expect(removeButtons).toHaveLength(0);
    });

    it("should not allow adding more than 6 options", () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      const addButton = screen.getByTestId("button-add-option");

      // Add 4 more options (total 6)
      for (let i = 0; i < 4; i++) {
        fireEvent.click(addButton);
      }

      // Assert
      expect(screen.getByPlaceholderText("Option 6")).toBeInTheDocument();
      expect(screen.queryByTestId("button-add-option")).not.toBeInTheDocument();
    });

    it("should call onCancel when cancel button is clicked", () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      const cancelButton = screen.getByTestId("button-cancel");
      fireEvent.click(cancelButton);

      // Assert
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("Form Validation", () => {
    it("should show error for empty title", async () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      const submitButton = screen.getByTestId("button-create-poll");
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Poll title is required")).toBeInTheDocument();
      });
    });

    it("should show error for title that is too short", async () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      const titleInput = screen.getByTestId("input-poll-title");
      fireEvent.change(titleInput, { target: { value: "Hi" } });

      const submitButton = screen.getByTestId("button-create-poll");
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText("Poll title must be at least 5 characters")
        ).toBeInTheDocument();
      });
    });

    it("should show error for title that is too long", async () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      const titleInput = screen.getByTestId("input-poll-title");
      const longTitle = "a".repeat(201);
      fireEvent.change(titleInput, { target: { value: longTitle } });

      const submitButton = screen.getByTestId("button-create-poll");
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText("Poll title must be no more than 200 characters")
        ).toBeInTheDocument();
      });
    });

    it("should show error for insufficient options", async () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      const titleInput = screen.getByTestId("input-poll-title");
      fireEvent.change(titleInput, { target: { value: "Valid Title" } });

      // Fill only one option
      const option1Input = screen.getByPlaceholderText("Option 1");
      fireEvent.change(option1Input, { target: { value: "Only Option" } });

      const submitButton = screen.getByTestId("button-create-poll");
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText("Poll must have at least 2 options")
        ).toBeInTheDocument();
      });
    });

    it("should show error for option that is too long", async () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      const titleInput = screen.getByTestId("input-poll-title");
      fireEvent.change(titleInput, { target: { value: "Valid Title" } });

      const option1Input = screen.getByPlaceholderText("Option 1");
      const option2Input = screen.getByPlaceholderText("Option 2");
      const longOption = "a".repeat(101);

      fireEvent.change(option1Input, { target: { value: longOption } });
      fireEvent.change(option2Input, { target: { value: "Valid Option" } });

      const submitButton = screen.getByTestId("button-create-poll");
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText("Each option must be no more than 100 characters")
        ).toBeInTheDocument();
      });
    });

    it("should clear errors when user starts typing", async () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      // Trigger title error
      const submitButton = screen.getByTestId("button-create-poll");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Poll title is required")).toBeInTheDocument();
      });

      // Start typing in title
      const titleInput = screen.getByTestId("input-poll-title");
      fireEvent.change(titleInput, { target: { value: "T" } });

      // Assert
      expect(
        screen.queryByText("Poll title is required")
      ).not.toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("should submit valid poll data successfully", async () => {
      // Arrange
      vi.mocked(habitatsService.createPoll).mockResolvedValue(mockPoll);

      // Act
      render(<PollCreationForm {...defaultProps} />);

      // Fill valid data
      const titleInput = screen.getByTestId("input-poll-title");
      const option1Input = screen.getByPlaceholderText("Option 1");
      const option2Input = screen.getByPlaceholderText("Option 2");

      fireEvent.change(titleInput, { target: { value: "Test Poll" } });
      fireEvent.change(option1Input, { target: { value: "Option A" } });
      fireEvent.change(option2Input, { target: { value: "Option B" } });

      const submitButton = screen.getByTestId("button-create-poll");
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(habitatsService.createPoll).toHaveBeenCalledWith(
          "habitat-1",
          "Test Poll",
          { "Option A": 0, "Option B": 0 },
          "user-1"
        );
      });

      expect(defaultProps.onSuccess).toHaveBeenCalledWith(mockPoll);
    });

    it("should handle submission with empty options filtered out", async () => {
      // Arrange
      vi.mocked(habitatsService.createPoll).mockResolvedValue(mockPoll);

      // Act
      render(<PollCreationForm {...defaultProps} />);

      // Add extra options, some empty
      const addButton = screen.getByTestId("button-add-option");
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      // Fill data with some empty options
      const titleInput = screen.getByTestId("input-poll-title");
      const option1Input = screen.getByPlaceholderText("Option 1");
      const option2Input = screen.getByPlaceholderText("Option 2");
      const option3Input = screen.getByPlaceholderText("Option 3");
      const option4Input = screen.getByPlaceholderText("Option 4");

      fireEvent.change(titleInput, { target: { value: "Test Poll" } });
      fireEvent.change(option1Input, { target: { value: "Option A" } });
      fireEvent.change(option2Input, { target: { value: "" } }); // Empty
      fireEvent.change(option3Input, { target: { value: "Option C" } });
      fireEvent.change(option4Input, { target: { value: "   " } }); // Whitespace only

      const submitButton = screen.getByTestId("button-create-poll");
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(habitatsService.createPoll).toHaveBeenCalledWith(
          "habitat-1",
          "Test Poll",
          { "Option A": 0, "Option C": 0 },
          "user-1"
        );
      });
    });

    it("should show loading state during submission", async () => {
      // Arrange
      vi.mocked(habitatsService.createPoll).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockPoll), 100))
      );

      // Act
      render(<PollCreationForm {...defaultProps} />);

      // Fill valid data
      const titleInput = screen.getByTestId("input-poll-title");
      const option1Input = screen.getByPlaceholderText("Option 1");
      const option2Input = screen.getByPlaceholderText("Option 2");

      fireEvent.change(titleInput, { target: { value: "Test Poll" } });
      fireEvent.change(option1Input, { target: { value: "Option A" } });
      fireEvent.change(option2Input, { target: { value: "Option B" } });

      const submitButton = screen.getByTestId("button-create-poll");
      fireEvent.click(submitButton);

      // Assert loading state
      expect(screen.getByText("Creating...")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled();
      });
    });

    it("should handle submission errors", async () => {
      // Arrange
      const error = new Error("Network error");
      const normalizedError = { message: "Failed to create poll" };
      vi.mocked(habitatsService.createPoll).mockRejectedValue(error);
      vi.mocked(normalizeError).mockReturnValue(normalizedError);

      // Act
      render(<PollCreationForm {...defaultProps} />);

      // Fill valid data
      const titleInput = screen.getByTestId("input-poll-title");
      const option1Input = screen.getByPlaceholderText("Option 1");
      const option2Input = screen.getByPlaceholderText("Option 2");

      fireEvent.change(titleInput, { target: { value: "Test Poll" } });
      fireEvent.change(option1Input, { target: { value: "Option A" } });
      fireEvent.change(option2Input, { target: { value: "Option B" } });

      const submitButton = screen.getByTestId("button-create-poll");
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Failed to create poll")).toBeInTheDocument();
      });

      expect(normalizeError).toHaveBeenCalledWith(error);
      expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper form structure", () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      // Assert
      const form = screen.getByRole("form");
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute("id", "poll-creation-form");
    });

    it("should have proper labels for inputs", () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      // Assert
      const labels = screen.getAllByTestId("label");
      expect(labels[0]).toHaveAttribute("for", "poll-title");
      expect(labels[0]).toHaveTextContent("Poll Title *");
    });

    it("should have accessible button labels", () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      // Assert
      expect(
        screen.getByRole("button", { name: /add option/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create poll/i })
      ).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid option additions and removals", () => {
      // Act
      render(<PollCreationForm {...defaultProps} />);

      const addButton = screen.getByTestId("button-add-option");

      // Add multiple options rapidly
      for (let i = 0; i < 4; i++) {
        fireEvent.click(addButton);
      }

      // Assert all options are present
      expect(screen.getByPlaceholderText("Option 6")).toBeInTheDocument();
      expect(screen.queryByTestId("button-add-option")).not.toBeInTheDocument();
    });

    it("should apply custom className", () => {
      // Act
      const { container } = render(
        <PollCreationForm {...defaultProps} className="custom-class" />
      );

      // Assert
      const form = container.querySelector("form");
      expect(form).toHaveClass("custom-class");
    });

    it("should handle special characters in options", async () => {
      // Arrange
      vi.mocked(habitatsService.createPoll).mockResolvedValue(mockPoll);

      // Act
      render(<PollCreationForm {...defaultProps} />);

      const titleInput = screen.getByTestId("input-poll-title");
      const option1Input = screen.getByPlaceholderText("Option 1");
      const option2Input = screen.getByPlaceholderText("Option 2");

      fireEvent.change(titleInput, {
        target: { value: "Special Characters Poll" },
      });
      fireEvent.change(option1Input, {
        target: { value: "Option with émojis 🚀" },
      });
      fireEvent.change(option2Input, {
        target: { value: "Option with <tags> & symbols!" },
      });

      const submitButton = screen.getByTestId("button-create-poll");
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(habitatsService.createPoll).toHaveBeenCalledWith(
          "habitat-1",
          "Special Characters Poll",
          {
            "Option with émojis 🚀": 0,
            "Option with <tags> & symbols!": 0,
          },
          "user-1"
        );
      });
    });
  });
});
