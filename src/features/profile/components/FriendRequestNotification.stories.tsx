import type { Meta, StoryObj } from "@storybook/react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";

// Simple mock component that mimics the FriendRequestNotification behavior
const MockFriendRequestNotification = ({ count, onOpenRequests }: { count: number; onOpenRequests: () => void }) => {
  if (count === 0) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenRequests}
        className="relative hover:bg-background/50"
        aria-label={`${count} pending friend request${count === 1 ? '' : 's'}`}
      >
        <Bell className="size-5" />
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 size-5 p-0 text-xs font-medium flex items-center justify-center min-w-5"
        >
          {count > 99 ? '99+' : count}
        </Badge>
      </Button>
    </div>
  );
};

const meta: Meta<typeof MockFriendRequestNotification> = {
  title: "Profile/FriendRequestNotification",
  component: MockFriendRequestNotification,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "FriendRequestNotification displays a bell icon with a badge showing the count of pending friend requests. Only renders when there are pending requests.",
      },
    },
  },
  args: {
    onOpenRequests: () => console.log("Opening friend requests modal"),
  },
  argTypes: {
    count: {
      control: { type: "number", min: 0, max: 200 },
      description: "Number of pending friend requests",
    },
  },
};

export default meta;
type Story = StoryObj<typeof MockFriendRequestNotification>;

/**
 * No requests - component doesn't render
 */
export const NoRequests: Story = {
  args: {
    count: 0,
  },
};

/**
 * Single pending request
 */
export const SingleRequest: Story = {
  args: {
    count: 1,
  },
};

/**
 * Multiple pending requests
 */
export const MultipleRequests: Story = {
  args: {
    count: 5,
  },
};

/**
 * Many requests (shows 99+)
 */
export const ManyRequests: Story = {
  args: {
    count: 150,
  },
};

/**
 * Edge case with exactly 99 requests
 */
export const ExactlyNinetyNine: Story = {
  args: {
    count: 99,
  },
};

/**
 * Edge case with 100 requests (shows 99+)
 */
export const OneHundred: Story = {
  args: {
    count: 100,
  },
};