import type { Meta, StoryObj } from "@storybook/react";
import { ProfileDiscovery } from "./ProfileDiscovery";
import type { ProfileWithFriendStatus } from "../domain/profiles.types";

const mockProfiles: ProfileWithFriendStatus[] = [
  {
    id: "1",
    userId: "user1",
    email: "user1@example.com",
    displayName: "John Doe",
    username: "johndoe",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    bio: "Movie enthusiast and sci-fi lover. Always looking for the next great film to discuss!",
    favoriteGenres: ["Action", "Sci-Fi", "Thriller"],
    favoriteTitles: ["The Matrix", "Inception", "Blade Runner 2049"],
    isPublic: true,
    onboardingCompleted: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    friendStatus: {
      status: "none",
    },
  },
  {
    id: "2",
    userId: "user2",
    email: "user2@example.com",
    displayName: "Jane Smith",
    username: "janesmith",
    avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    bio: "TV show addict with a passion for character-driven dramas and clever comedies.",
    favoriteGenres: ["Drama", "Comedy", "Mystery"],
    favoriteTitles: ["Breaking Bad", "The Office", "Sherlock"],
    isPublic: true,
    onboardingCompleted: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    friendStatus: {
      status: "pending_sent",
    },
  },
  {
    id: "3",
    userId: "user3",
    email: "user3@example.com",
    displayName: "Mike Johnson",
    username: "mikej",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: "Horror and thriller fan. Love discussing plot twists and cinematography.",
    favoriteGenres: ["Horror", "Thriller", "Mystery"],
    favoriteTitles: ["Get Out", "Hereditary", "The Silence of the Lambs"],
    isPublic: true,
    onboardingCompleted: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    friendStatus: {
      status: "friends",
    },
  },
  {
    id: "4",
    userId: "user4",
    email: "user4@example.com",
    displayName: "Sarah Wilson",
    username: "sarahw",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    bio: "Animation and fantasy enthusiast. Studio Ghibli films are my weakness!",
    favoriteGenres: ["Animation", "Fantasy", "Adventure"],
    favoriteTitles: ["Spirited Away", "Princess Mononoke", "Your Name"],
    isPublic: true,
    onboardingCompleted: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    friendStatus: {
      status: "pending_received",
    },
  },
];

const meta: Meta<typeof ProfileDiscovery> = {
  title: "Features/Profile/ProfileDiscovery",
  component: ProfileDiscovery,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Profile discovery component that allows users to browse and connect with other users on the platform.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProfileDiscovery>;

export const WithProfiles: Story = {
  args: {
    initialProfiles: mockProfiles,
    initialPagination: {
      limit: 20,
      offset: 0,
      hasMore: true,
    },
  },
};

export const EmptyState: Story = {
  args: {
    initialProfiles: [],
    initialPagination: {
      limit: 20,
      offset: 0,
      hasMore: false,
    },
  },
};

export const LoadingState: Story = {
  args: {
    // No initial data provided, will show loading state
  },
};

export const FewProfiles: Story = {
  args: {
    initialProfiles: mockProfiles.slice(0, 2),
    initialPagination: {
      limit: 20,
      offset: 0,
      hasMore: false,
    },
  },
};