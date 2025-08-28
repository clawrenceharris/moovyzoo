import type { Meta, StoryObj } from "@storybook/react";
import { ErrorState } from "./ErrorState";
import { AlertTriangle, Wifi, Database } from "lucide-react";

const meta: Meta<typeof ErrorState> = {
  title: "Components/States/ErrorState",
  component: ErrorState,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "ErrorState provides consistent error display with retry functionality across different UI contexts.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "minimal", "card", "inline"],
      description: "The display variant",
    },
    title: {
      control: "text",
      description: "The error title/heading",
    },
    message: {
      control: "text",
      description: "Detailed error message",
    },
    retryLabel: {
      control: "text",
      description: "Text for the retry button",
    },
    showIcon: {
      control: "boolean",
      description: "Whether to show the error icon",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ErrorState>;

/**
 * Default error state with full message and retry
 */
export const Default: Story = {
  args: {
    variant: "default",
    title: "Failed to load habitats",
    message:
      "We encountered an error while loading your habitats. Please check your connection and try again.",
    onRetry: () => alert("Retry clicked!"),
  },
};

/**
 * Minimal error state for inline use
 */
export const Minimal: Story = {
  args: {
    variant: "minimal",
    title: "Upload failed",
    onRetry: () => alert("Retry clicked!"),
  },
};

/**
 * Card-style error for prominent display
 */
export const Card: Story = {
  args: {
    variant: "card",
    title: "Network Error",
    message:
      "Unable to connect to the server. Please check your internet connection.",
    onRetry: () => alert("Retry clicked!"),
  },
};

/**
 * Inline error for form fields and compact spaces
 */
export const Inline: Story = {
  args: {
    variant: "inline",
    title: "Validation Error",
    message: "Please check your input and try again.",
    onRetry: () => alert("Retry clicked!"),
  },
};

/**
 * Error with custom network icon
 */
export const WithCustomIcon: Story = {
  args: {
    variant: "default",
    title: "Connection Lost",
    message: "Unable to connect to Zoovie servers.",
    icon: <Wifi className="w-12 h-12 text-destructive" />,
    onRetry: () => alert("Retry clicked!"),
  },
};

/**
 * Database error with custom icon
 */
export const DatabaseError: Story = {
  args: {
    variant: "card",
    title: "Database Error",
    message: "There was a problem accessing your data.",
    icon: <Database className="w-12 h-12 text-destructive" />,
    onRetry: () => alert("Retry clicked!"),
  },
};

/**
 * Error without retry action
 */
export const NoRetry: Story = {
  args: {
    variant: "default",
    title: "Access Denied",
    message: "You do not have permission to view this content.",
  },
};

/**
 * Error without icon
 */
export const NoIcon: Story = {
  args: {
    variant: "inline",
    title: "Form Error",
    message: "Please correct the highlighted fields.",
    showIcon: false,
  },
};
