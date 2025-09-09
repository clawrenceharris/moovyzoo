import type { Meta, StoryObj } from "@storybook/react";
// Mock function for storybook actions
const fn = () => () => {};
import { ProfileCard } from "./ProfileCard";
import type { UserProfile, ProfileWithFriendStatus } from "../domain/profiles.types";

const mockProfile: UserProfile = {
  id: "1",
  userId: "user-1",
  email: "test@example.com",
  displayName: "Alex Johnson",
  username: "alexj",
  avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  bio: "Movie enthusiast and aspiring filmmaker. Love discussing plot twists and cinematography!",
  favoriteGenres: ["Action", "Sci-Fi", "Thriller", "Drama"],
  favoriteTitles: ["Inception", "The Dark Knight", "Interstellar"],
  isPublic: true,
  onboardingCompleted: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const meta: Meta<typeof ProfileCard> = {
  title: "Features/Profile/ProfileCard",
  component: ProfileCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onViewProfile: { action: "view profile" },
    onSendMessage: { action: "send message" },
    onAddFriend: { action: "add friend" },
    onFriendAction: { action: "friend action" },
  },
  args: {
    onViewProfile: fn(),
    onSendMessage: fn(),
    onAddFriend: fn(),
    onFriendAction: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    profile: mockProfile,
  },
};

export const WithoutActions: Story = {
  args: {
    profile: mockProfile,
    showActions: false,
  },
};

export const NoFriendStatus: Story = {
  args: {
    profile: mockProfile,
  },
  name: "Legacy - No Friend Status",
};

export const FriendStatusNone: Story = {
  args: {
    profile: {
      ...mockProfile,
      friendStatus: {
        status: "none",
      },
    } as ProfileWithFriendStatus,
  },
  name: "Friend Status - None (Add Friend)",
};

export const FriendStatusPendingSent: Story = {
  args: {
    profile: {
      ...mockProfile,
      friendStatus: {
        status: "pending_sent",
        friendshipId: "friendship-1",
      },
    } as ProfileWithFriendStatus,
  },
  name: "Friend Status - Request Sent",
};

export const FriendStatusPendingReceived: Story = {
  args: {
    profile: {
      ...mockProfile,
      friendStatus: {
        status: "pending_received",
        friendshipId: "friendship-2",
      },
    } as ProfileWithFriendStatus,
  },
  name: "Friend Status - Pending (Accept/Decline)",
};

export const FriendStatusFriends: Story = {
  args: {
    profile: {
      ...mockProfile,
      friendStatus: {
        status: "friends",
        friendshipId: "friendship-3",
      },
    } as ProfileWithFriendStatus,
  },
  name: "Friend Status - Already Friends",
};

export const FriendStatusBlocked: Story = {
  args: {
    profile: {
      ...mockProfile,
      friendStatus: {
        status: "blocked",
        friendshipId: "friendship-4",
      },
    } as ProfileWithFriendStatus,
  },
  name: "Friend Status - Blocked (No Button)",
};

export const WithoutAvatar: Story = {
  args: {
    profile: {
      ...mockProfile,
      avatarUrl: undefined,
      displayName: "Jane Smith",
    },
  },
  name: "Without Avatar (Shows Initials)",
};

export const LongBio: Story = {
  args: {
    profile: {
      ...mockProfile,
      bio: "I'm a passionate movie lover who enjoys everything from indie films to blockbuster hits. I particularly love analyzing cinematography, storytelling techniques, and character development. Always looking for new recommendations and love discussing movies with fellow enthusiasts!",
    },
  },
  name: "Long Bio (Truncated)",
};

export const ManyGenres: Story = {
  args: {
    profile: {
      ...mockProfile,
      favoriteGenres: ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller"],
    },
  },
  name: "Many Genres (Shows +N)",
};

export const MinimalProfile: Story = {
  args: {
    profile: {
      ...mockProfile,
      bio: undefined,
      favoriteGenres: [],
      username: undefined,
    },
  },
  name: "Minimal Profile Info",
};