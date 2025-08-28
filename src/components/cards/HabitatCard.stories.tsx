import type { Meta, StoryObj } from "@storybook/react";
import { HabitatCard } from "./HabitatCard";
import type { HabitatWithMembership } from "@/features/habitats/domain/habitats.types";

// Mock habitat data
const mockHabitat: HabitatWithMembership = {
  id: "1",
  name: "Marvel Cinematic Universe",
  description:
    "Discuss the latest Marvel movies, theories, and character developments in the MCU.",
  tags: ["Marvel", "Superhero", "Action", "Disney+", "Movies"],
  banner_url:
    "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&h=400&fit=crop",
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-20T15:30:00Z",
  created_by: "user-1",
  is_member: true,
  member_count: 1247,
  recent_activity: {
    discussions_count: 42,
    active_watch_parties: 3,
    recent_messages: 156,
    last_activity_at: "2024-01-20T15:30:00Z",
  },
};

const mockHabitatNoBanner: HabitatWithMembership = {
  ...mockHabitat,
  id: "2",
  name: "Indie Film Lovers",
  description: "A cozy space for discovering and discussing independent films.",
  tags: ["Indie", "Art House"],
  banner_url: null,
  member_count: 89,
};

const mockHabitatManyTags: HabitatWithMembership = {
  ...mockHabitat,
  id: "3",
  name: "Sci-Fi Universe",
  description: "Explore the vast worlds of science fiction across all media.",
  tags: [
    "Sci-Fi",
    "Space",
    "Future",
    "Technology",
    "Aliens",
    "Time Travel",
    "Dystopia",
  ],
  member_count: 2156,
};

const meta: Meta<typeof HabitatCard> = {
  title: "Components/Cards/HabitatCard",
  component: HabitatCard,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "HabitatCard displays habitat information in a cinematic card layout with banner images, tags, and member counts.",
      },
    },
  },
  argTypes: {
    habitat: {
      description: "The habitat data to display",
    },
    onClick: {
      description: "Callback when the card is clicked",
      action: "clicked",
    },
    memberCount: {
      control: { type: "number", min: 0 },
      description: "Override the displayed member count",
    },
    buttonLabel: {
      control: "text",
      description: "Text for the action button",
    },
    buttonVariant: {
      control: "select",
      options: ["default", "secondary", "tertiary", "outline", "ghost"],
      description: "Style variant for the action button",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof HabitatCard>;

/**
 * Default habitat card with banner image and tags
 */
export const Default: Story = {
  args: {
    habitat: mockHabitat,
    onClick: (id: string) => console.log("Clicked habitat:", id),
  },
};

/**
 * Habitat card without banner image (shows gradient fallback)
 */
export const NoBanner: Story = {
  args: {
    habitat: mockHabitatNoBanner,
    onClick: (id: string) => console.log("Clicked habitat:", id),
  },
};

/**
 * Habitat card with many tags (shows overflow indicator)
 */
export const ManyTags: Story = {
  args: {
    habitat: mockHabitatManyTags,
    onClick: (id: string) => console.log("Clicked habitat:", id),
  },
};

/**
 * Habitat card with custom member count
 */
export const CustomMemberCount: Story = {
  args: {
    habitat: mockHabitat,
    memberCount: 5000,
    onClick: (id: string) => console.log("Clicked habitat:", id),
  },
};

/**
 * Habitat card with custom button label and variant
 */
export const CustomButton: Story = {
  args: {
    habitat: mockHabitat,
    buttonLabel: "Join Now",
    buttonVariant: "default",
    onClick: (id: string) => console.log("Clicked habitat:", id),
  },
};

/**
 * Habitat card with outline button
 */
export const OutlineButton: Story = {
  args: {
    habitat: mockHabitat,
    buttonLabel: "Explore",
    buttonVariant: "outline",
    onClick: (id: string) => console.log("Clicked habitat:", id),
  },
};

/**
 * Habitat card with ghost button
 */
export const GhostButton: Story = {
  args: {
    habitat: mockHabitat,
    buttonLabel: "Preview",
    buttonVariant: "ghost",
    onClick: (id: string) => console.log("Clicked habitat:", id),
  },
};

/**
 * Small habitat with minimal content
 */
export const SmallHabitat: Story = {
  args: {
    habitat: {
      ...mockHabitat,
      name: "Horror Nights",
      description: "Scary movies and thrills.",
      tags: ["Horror"],
      member_count: 12,
    },
    onClick: (id: string) => console.log("Clicked habitat:", id),
  },
};
