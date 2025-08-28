import type { Meta, StoryObj } from "@storybook/react";
import { LoadingState } from "./LoadingState";

const meta: Meta<typeof LoadingState> = {
  title: "Components/States/LoadingState",
  component: LoadingState,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "LoadingState provides consistent loading skeletons across different layouts with animated placeholders.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["grid", "list", "inline", "card"],
      description: "The layout variant to render",
    },
    count: {
      control: { type: "number", min: 1, max: 12 },
      description: "Number of skeleton items to display",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingState>;

/**
 * Default grid layout optimized for habitat cards
 */
export const Grid: Story = {
  args: {
    variant: "grid",
    count: 6,
  },
};

/**
 * List layout for discussions and content lists
 */
export const List: Story = {
  args: {
    variant: "list",
    count: 4,
  },
};

/**
 * Inline layout for small components and navigation
 */
export const Inline: Story = {
  args: {
    variant: "inline",
    count: 5,
  },
};

/**
 * Card layout for general content cards
 */
export const Card: Story = {
  args: {
    variant: "card",
    count: 3,
  },
};

/**
 * Single item loading state
 */
export const SingleItem: Story = {
  args: {
    variant: "grid",
    count: 1,
  },
};

/**
 * Many items loading state
 */
export const ManyItems: Story = {
  args: {
    variant: "list",
    count: 10,
  },
};
