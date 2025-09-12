"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";

interface FriendRequestNotificationProps {
  count: number;
  loading: boolean;
  onOpenRequests: () => void;
  onRefresh: () => Promise<void>;
}

export function FriendRequestNotification({ 
  count, 
  loading, 
  onOpenRequests, 
  onRefresh 
}: FriendRequestNotificationProps) {
  const handleClick = async () => {
    // Refresh friend requests when button is clicked
    await onRefresh();
    onOpenRequests();
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={loading}
        className="relative hover:bg-background/50"
        aria-label={count > 0 ? `${count} pending friend request${count === 1 ? '' : 's'}` : 'Open friend requests'}
      >
        <Bell className="size-5" />
        {count > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 size-5 p-0 text-xs font-medium flex items-center justify-center min-w-5"
          >
            {count > 99 ? '99+' : count}
          </Badge>
        )}
      </Button>
    </div>
  );
}