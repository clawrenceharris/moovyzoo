import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DiscussionCreationForm } from "../DiscussionCreationForm";
import {
  createDiscussionSchema,
  type CreateDiscussionInput,
} from "../../domain";

// Mock the form components
vi.mock("@/components/ui/form", () => ({
  FormControl: ({ children }: any) => (
    <div data-testid="form-control">{children}</div>
  ),
  FormField: ({ render, name, control, defaultValue }: any) => {
    const field = { name, value: defaultValue || "", onChange: vi.fn() };
    return render({ field });
  },
  FormItem: ({ children }: any) => (
    <div data-testid="form-item">{children}</div>
  ),
  FormLabel: ({ children, className }: any) => (
    <label className={className} data-testid="form-label">
      {children}
    </label>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ placeholder, className, disabled, maxLength, ...props }: any) => (
    <input
      data-testid={`input-${placeholder?.toLowerCase().replace(/\s+/g, "-")}`}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      maxLength={maxLength}
      {...props}
    />
  ),
}));

// Test wrapper component that provides form context
function TestWrapper({
  children,
  defaultValues = {},
  onSubmit = vi.fn(),
}: {
  children: React.ReactNode;
  defaultValues?: Partial<CreateDiscussionInput>;
  onSubmit?: (data: CreateDiscussionInput) => void;
}) {
  const methods = useForm<CreateDiscussionInput>({
    resolver: zodResolver(createDiscussionSchema),
    defaultValues: {
      name: "",
      description: "",
      ...defaultValues,
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        {children}
        <button type="submit" data-testid="submit-button">
          Submit
        </button>
      </form>
    </FormProvider>
  );
}

describe("DiscussionCreationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render discussion name input field", () => {
      // Act
      render(
        <TestWrapper>
          <DiscussionCreationForm />
        </TestWrapper>
      );

      // Assert
      expect(screen.getByTestId("input-discussion-title")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Discussion Title")
      ).toBeInTheDocument();
    });

    it("should render description input field", () => {
      // Act
      render(
        <TestWrapper>
          <DiscussionCreationForm />
        </TestWrapper>
      );

      // Assert
      expect(screen.getByTestId("input-description")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Description")).toBeInTheDocument();
    });

    it("should render form labels with screen reader accessibility", () => {
      // Act
      render(
        <TestWrapper>
          <DiscussionCreationForm />
        </TestWrapper>
      );

      // Assert
      const labels = screen.getAllByTestId("form-label");
      expect(labels).toHaveLength(2);
      expect(labels[0]).toHaveTextContent("Discussion Title");
      expect(labels[1]).toHaveTextContent("Description (Optional)");

      // Labels should have sr-only class for screen readers
      labels.forEach((label) => {
        expect(label).toHaveClass("sr-only");
      });
    });

    it("should set correct input attributes", () => {
      // Act
      render(
        <TestWrapper>
          <DiscussionCreationForm />
        </TestWrapper>
      );

      // Assert
      const nameInput = screen.getByTestId("input-discussion-title");
      const descriptionInput = screen.getByTestId("input-description");

      expect(nameInput).toHaveAttribute("type", "text");
      expect(descriptionInput).toHaveAttribute("maxLength", "500");
    });
  });

  describe("Form Validation", () => {
    it("should show error for empty discussion name", async () => {
      // Arrange
      const onSubmit = vi.fn();

      // Act
      render(
        <TestWrapper onSubmit={onSubmit}>
          <DiscussionCreationForm />
        </TestWrapper>
      );

      // Submit form without filling name
      fireEvent.click(screen.getByTestId("submit-button"));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/discussion name is required/i)
        ).toBeInTheDocument();
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should show error for discussion name that is too short", async () => {
      // Arrange
      const onSubmit = vi.fn();

      // Act
      render(
        <TestWrapper onSubmit={onSubmit}>
          <DiscussionCreationForm />
        </TestWrapper>
      );

      // Fill with short name
      const nameInput = screen.getByTestId("input-discussion-title");
      fireEvent.change(nameInput, { target: { value: "Hi" } });
      fireEvent.click(screen.getByTestId("submit-button"));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/must be at least 3 characters/i)
        ).toBeInTheDocument();
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should show error for discussion name that is too long", async () => {
      // Arrange
      const onSubmit = vi.fn();
      const longName = "a".repeat(101); // 101 characters

      // Act
      render(
        <TestWrapper onSubmit={onSubmit}>
          <DiscussionCreationForm />
        </TestWrapper>
      );

      // Fill with long name
      const nameInput = screen.getByTestId("input-discussion-title");
      fireEvent.change(nameInput, { target: { value: longName } });
      fireEvent.click(screen.getByTestId("submit-button"));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/must be no more than 100 characters/i)
        ).toBeInTheDocument();
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should show error for description that is too long", async () => {
      // Arrange
      const onSubmit = vi.fn();
      const longDescription = "a".repeat(501); // 501 characters

      // Act
      render(
        <TestWrapper onSubmit={onSubmit}>
          <DiscussionCreationForm />
        </TestWrapper>
      );

      // Fill with valid name and long description
      const nameInput = screen.getByTestId("input-discussion-title");
      const descriptionInput = screen.getByTestId("input-description");

      fireEvent.change(nameInput, {
        target: { value: "Valid Discussion Name" },
      });
      fireEvent.change(descriptionInput, {
        target: { value: longDescription },
      });
      fireEvent.click(screen.getByTestId("submit-button"));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/must be no more than 500 characters/i)
        ).toBeInTheDocument();
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should allow valid form submission", async () => {
      // Arrange
      const onSubmit = vi.fn();
      const validData = {
        name: "Great Discussion Topic",
        description: "This is a valid description for the discussion",
      };

      // Act
      render(
        <TestWrapper onSubmit={onSubmit}>
          <DiscussionCreationForm />
        </TestWrapper>
      );

      // Fill form with valid data
      const nameInput = screen.getByTestId("input-discussion-title");
      const descriptionInput = screen.getByTestId("input-description");

      fireEvent.change(nameInput, { target: { value: validData.name } });
      fireEvent.change(descriptionInput, {
        target: { value: validData.description },
      });
      fireEvent.click(screen.getByTestId("submit-button"));

      // Assert
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(validData);
      });
    });

    it("should allow submission with empty description", async () => {
      // Arrange
      const onSubmit = vi.fn();
      const validData = {
        name: "Discussion Without Description",
        description: "",
      };

      // Act
      render(
        <TestWrapper onSubmit={onSubmit}>
          <DiscussionCreationForm />
        </TestWrapper>
      );

      // Fill only name field
      const nameInput = screen.getByTestId("input-discussion-title");
      fireEvent.change(nameInput, { target: { value: validData.name } });
      fireEvent.click(screen.getByTestId("submit-button"));

      // Assert
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(validData);
      });
    });
  });

  describe("Form State Management", () => {
    it("should disable inputs when form is submitting", () => {
      // Arrange - Mock submitting state
      const TestWrapperWithSubmitting = ({
        children,
      }: {
        children: React.ReactNode;
      }) => {
        const methods = useForm<CreateDiscussionInput>({
          resolver: zodResolver(createDiscussionSchema),
          defaultValues: { name: "", description: "" },
        });

        // Mock submitting state
        Object.defineProperty(methods.formState, "isSubmitting", {
          value: true,
          writable: false,
        });

        return <FormProvider {...methods}>{children}</FormProvider>;
      };

      // Act
      render(
        <TestWrapperWithSubmitting>
          <DiscussionCreationForm />
        </TestWrapperWithSubmitting>
      );

      // Assert
      expect(screen.getByTestId("input-discussion-title")).toBeDisabled();
      expect(screen.getByTestId("input-description")).toBeDisabled();
    });

    it("should apply error styling when field has errors", () => {
      // Arrange - Mock form with errors
      const TestWrapperWithErrors = ({
        children,
      }: {
        children: React.ReactNode;
      }) => {
        const methods = useForm<CreateDiscussionInput>({
          resolver: zodResolver(createDiscussionSchema),
          defaultValues: { name: "", description: "" },
        });

        // Mock errors
        Object.defineProperty(methods.formState, "errors", {
          value: {
            name: { message: "Discussion name is required" },
          },
          writable: false,
        });

        return <FormProvider {...methods}>{children}</FormProvider>;
      };

      // Act
      render(
        <TestWrapperWithErrors>
          <DiscussionCreationForm />
        </TestWrapperWithErrors>
      );

      // Assert
      const nameInput = screen.getByTestId("input-discussion-title");
      expect(nameInput).toHaveClass("border-red-500");
    });

    it("should display error messages for invalid fields", () => {
      // Arrange - Mock form with errors
      const TestWrapperWithErrors = ({
        children,
      }: {
        children: React.ReactNode;
      }) => {
        const methods = useForm<CreateDiscussionInput>({
          resolver: zodResolver(createDiscussionSchema),
          defaultValues: { name: "", description: "" },
        });

        // Mock errors
        Object.defineProperty(methods.formState, "errors", {
          value: {
            name: { message: "Discussion name is required" },
            description: { message: "Description is too long" },
          },
          writable: false,
        });

        return <FormProvider {...methods}>{children}</FormProvider>;
      };

      // Act
      render(
        <TestWrapperWithErrors>
          <DiscussionCreationForm />
        </TestWrapperWithErrors>
      );

      // Assert
      expect(
        screen.getByText("Discussion name is required")
      ).toBeInTheDocument();
      expect(screen.getByText("Description is too long")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper form structure", () => {
      // Act
      render(
        <TestWrapper>
          <DiscussionCreationForm />
        </TestWrapper>
      );

      // Assert
      expect(screen.getAllByTestId("form-item")).toHaveLength(2);
      expect(screen.getAllByTestId("form-control")).toHaveLength(2);
    });

    it("should have accessible labels", () => {
      // Act
      render(
        <TestWrapper>
          <DiscussionCreationForm />
        </TestWrapper>
      );

      // Assert
      const labels = screen.getAllByTestId("form-label");
      expect(labels[0]).toHaveTextContent("Discussion Title");
      expect(labels[1]).toHaveTextContent("Description (Optional)");
    });

    it("should have proper input placeholders", () => {
      // Act
      render(
        <TestWrapper>
          <DiscussionCreationForm />
        </TestWrapper>
      );

      // Assert
      expect(
        screen.getByPlaceholderText("Discussion Title")
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Description")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle form with pre-filled values", () => {
      // Arrange
      const defaultValues = {
        name: "Pre-filled Discussion",
        description: "Pre-filled description",
      };

      // Act
      render(
        <TestWrapper defaultValues={defaultValues}>
          <DiscussionCreationForm />
        </TestWrapper>
      );

      // Assert
      const nameInput = screen.getByTestId("input-discussion-title");
      const descriptionInput = screen.getByTestId("input-description");

      expect(nameInput).toHaveValue("Pre-filled Discussion");
      expect(descriptionInput).toHaveValue("Pre-filled description");
    });

    it("should handle special characters in input", async () => {
      // Arrange
      const onSubmit = vi.fn();
      const specialCharData = {
        name: "Discussion with émojis 🚀 & symbols!",
        description: "Description with <tags> & special chars: @#$%",
      };

      // Act
      render(
        <TestWrapper onSubmit={onSubmit}>
          <DiscussionCreationForm />
        </TestWrapper>
      );

      // Fill form with special characters
      const nameInput = screen.getByTestId("input-discussion-title");
      const descriptionInput = screen.getByTestId("input-description");

      fireEvent.change(nameInput, { target: { value: specialCharData.name } });
      fireEvent.change(descriptionInput, {
        target: { value: specialCharData.description },
      });
      fireEvent.click(screen.getByTestId("submit-button"));

      // Assert
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(specialCharData);
      });
    });

    it("should handle whitespace-only input", async () => {
      // Arrange
      const onSubmit = vi.fn();

      // Act
      render(
        <TestWrapper onSubmit={onSubmit}>
          <DiscussionCreationForm />
        </TestWrapper>
      );

      // Fill with whitespace-only name
      const nameInput = screen.getByTestId("input-discussion-title");
      fireEvent.change(nameInput, { target: { value: "   " } });
      fireEvent.click(screen.getByTestId("submit-button"));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/discussion name is required/i)
        ).toBeInTheDocument();
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should handle maximum length inputs correctly", async () => {
      // Arrange
      const onSubmit = vi.fn();
      const maxLengthData = {
        name: "a".repeat(100), // Exactly 100 characters
        description: "b".repeat(500), // Exactly 500 characters
      };

      // Act
      render(
        <TestWrapper onSubmit={onSubmit}>
          <DiscussionCreationForm />
        </TestWrapper>
      );

      // Fill with maximum length data
      const nameInput = screen.getByTestId("input-discussion-title");
      const descriptionInput = screen.getByTestId("input-description");

      fireEvent.change(nameInput, { target: { value: maxLengthData.name } });
      fireEvent.change(descriptionInput, {
        target: { value: maxLengthData.description },
      });
      fireEvent.click(screen.getByTestId("submit-button"));

      // Assert
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(maxLengthData);
      });
    });
  });
});
