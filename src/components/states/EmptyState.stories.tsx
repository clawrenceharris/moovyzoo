import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "./EmptyState";
import { Plus, Search, Users, MessageCircle } from "lucide-react";

const meta: Meta<typeof EmptyState> = {
  title: "Components/States/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "EmptyState provides consistent empty state display with action buttons to guide users.",
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
      description: "The empty state title/heading",
    },
    description: {
      control: "text",
      description: "Descriptive text explaining the empty state",
    },
    actionLabel: {
      control: "text",
      description: "Text for the primary action button",
    },
    secondaryActionLabel: {
      control: "text",
      description: "Text for the secondary action button",
    },
    showIcon: {
      control: "boolean",
      description: "Whether to show the empty state icon",
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

/**
 * Default empty state with primary action
 */
export const Default: Story = {
  args: {
    variant: "default",
    title: "No habitats found",
    description: "Create your first habitat to start building your community.",
    actionLabel: "Create Habitat",
    onAction: () => alert("Create habitat clicked!"),
  },
};

/**
 * Minimal empty state for compact spaces
 */
export const Minimal: Story = {
  args: {
    variant: "minimal",
    title: "No messages",
    actionLabel: "Send message",
    onAction: () => alert("Send message clicked!"),
  },
};

/**
 * Card-style empty state
 */
export const Card: Story = {
  args: {
    variant: "card",
    title: "No discussions yet",
    description:
      "Start the conversation by creating the first discussion topic.",
    actionLabel: "Start Discussion",
    onAction: () => alert("Start discussion clicked!"),
  },
};

/**
 * Inline empty state for lists
 */
export const Inline: Story = {
  args: {
    variant: "inline",
    title: "No results found",
    description: "Try adjusting your search criteria.",
    actionLabel: "Clear filters",
    onAction: () => alert("Clear filters clicked!"),
  },
};

/**
 * Empty state with primary and secondary actions
 */
export const WithSecondaryAction: Story = {
  args: {
    variant: "default",
    title: "No watch parties scheduled",
    description:
      "Create a watch party or browse upcoming events from other habitats.",
    actionLabel: "Create Watch Party",
    onAction: () => alert("Create party clicked!"),
    secondaryActionLabel: "Browse Events",
    onSecondaryAction: () => alert("Browse events clicked!"),
  },
};

/**
 * Empty search results with custom icon
 */
export const SearchResults: Story = {
  args: {
    variant: "card",
    title: "No search results",
    description: "We couldn't find any habitats matching your search.",
    icon: <Search className="w-12 h-12 text-muted-foreground" />,
    actionLabel: "Clear Search",
    onAction: () => alert("Clear search clicked!"),
    secondaryActionLabel: "Browse All",
    onSecondaryAction: () => alert("Browse all clicked!"),
  },
};

/**
 * Empty community with custom icon
 */
export const EmptyCommunity: Story = {
  args: {
    variant: "default",
    title: "No members yet",
    description:
      "Invite friends to join your habitat and start the conversation.",
    icon: <Users className="w-12 h-12 text-muted-foreground" />,
    actionLabel: "Invite Friends",
    onAction: () => alert("Invite friends clicked!"),
  },
};

/**
 * Empty state without actions
 */
export const NoActions: Story = {
  args: {
    variant: "card",
    title: "Coming Soon",
    description:
      "This feature is currently in development and will be available soon.",
  },
};

/**
 * Empty state without icon
 */
export const NoIcon: Story = {
  args: {
    variant: "inline",
    title: "No notifications",
    description: "You're all caught up!",
    showIcon: false,
  },
};
