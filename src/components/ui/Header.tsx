"use client";
import { useAuth } from "@/features/auth/hooks";
import { Button } from "./button";
import {
  FriendRequestNotification,
  FriendRequestsModal,
} from "@/features/profile/components";
import { useFriendRequests } from "@/features/profile/hooks/use-friend-requests";
import { useState, useCallback } from "react";

export default function Header() {
  const { logout } = useAuth();
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);

  // Load pending friend requests for the modal
  const { requests, loading, error, refetch } = useFriendRequests();

  const handleAccept = useCallback(
    async (requestId: string) => {
      try {
        const res = await fetch(`/api/friends/${requestId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "accept" }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to accept request");
        }
        await refetch();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    },
    [refetch]
  );

  const handleDecline = useCallback(
    async (requestId: string) => {
      try {
        const res = await fetch(`/api/friends/${requestId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "decline" }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to decline request");
        }
        await refetch();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    },
    [refetch]
  );

  return (
    <header className="sticky top-0 z-30 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="mx-auto max-w-screen-2xl px-8 py-3 flex items-end justify-end">
        <div className="flex items-center gap-2">
          <FriendRequestNotification
            count={requests.length}
            loading={loading}
            onOpenRequests={() => setIsRequestsOpen(true)}
            onRefresh={refetch}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            aria-label="Log out"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Friend Requests Modal */}
      <FriendRequestsModal
        isOpen={isRequestsOpen}
        onClose={() => setIsRequestsOpen(false)}
        requests={requests}
        onAccept={handleAccept}
        onDecline={handleDecline}
        loading={loading}
        error={error}
      />
    </header>
  );
}
