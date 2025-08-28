import type { Meta, StoryObj } from "@storybook/react";
import { DiscussionCard } from "./DiscussionCard";
import type { DiscussionWithStats } from "@/features/habitats/domain/habitats.types";

// Mock discussion data
const mockDiscussion: DiscussionWithStats = {
  id: "1",
  habitat_id: "habitat-1",
  name: "What did you think of the latest Marvel movie?",
  description:
    "Let's discuss the plot, characters, and theories about where the MCU is heading next.",
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-20T15:30:00Z",
  created_by: "user-1",
  message_count: 47,
  last_message_at: "2024-01-20T15:30:00Z",
  participant_count: 12,
};

const mockDiscussionNoDescription: DiscussionWithStats = {
  ...mockDiscussion,
  id: "2",
  name: "Quick poll: Favorite superhero?",
  description: null,
  message_count: 23,
};

const mockDiscussionLongTitle: DiscussionWithStats = {
  ...mockDiscussion,
  id: "3",
  name: "In-depth analysis of the cinematography and visual effects in the latest blockbuster release",
  description:
    "A comprehensive breakdown of the technical aspects that made this movie visually stunning.",
  message_count: 156,
};

const mockDiscussionNoMessages: DiscussionWithStats = {
  ...mockDiscussion,
  id: "4",
  name: "New discussion topic",
  description: "Just started this discussion, be the first to comment!",
  message_count: 0,
  last_message_at: null,
};

const meta: Meta<typeof DiscussionCard> = {
  title: "Components/Cards/DiscussionCard",
  component: DiscussionCard,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "DiscussionCard displays discussion information in a compact card format with message counts and hover effects.",
      },
    },
  },
  argTypes: {
    discussion: {
      description: "The discussion data to display",
    },
    onClick: {
      description: "Callback when the card is clicked",
      action: "clicked",
    },
    showDescription: {
      control: "boolean",
      description: "Whether to show the discussion description",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof DiscussionCard>;

/**
 * Default discussion card with description and message count
 */
export const Default: Story = {
  args: {
    discussion: mockDiscussion,
    onClick: () => console.log("Discussion clicked"),
  },
};

/**
 * Discussion card without description
 */
export const NoDescription: Story = {
  args: {
    discussion: mockDiscussionNoDescription,
    onClick: () => console.log("Discussion clicked"),
  },
};

/**
 * Discussion card with description hidden
 */
export const DescriptionHidden: Story = {
  args: {
    discussion: mockDiscussion,
    showDescription: false,
    onClick: () => console.log("Discussion clicked"),
  },
};

/**
 * Discussion card with long title
 */
export const LongTitle: Story = {
  args: {
    discussion: mockDiscussionLongTitle,
    onClick: () => console.log("Discussion clicked"),
  },
};

/**
 * Discussion card with no messages yet
 */
export const NoMessages: Story = {
  args: {
    discussion: mockDiscussionNoMessages,
    onClick: () => console.log("Discussion clicked"),
  },
};

/**
 * Discussion card with high message count
 */
export const HighActivity: Story = {
  args: {
    discussion: {
      ...mockDiscussion,
      name: "Hot topic: Movie rankings debate",
      message_count: 1247,
      participant_count: 89,
    },
    onClick: () => console.log("Discussion clicked"),
  },
};

/**
 * Discussion card with custom styling
 */
export const CustomStyling: Story = {
  args: {
    discussion: mockDiscussion,
    className: "border-accent bg-accent/5",
    onClick: () => console.log("Discussion clicked"),
  },
};
