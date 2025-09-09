"use client";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useUser } from "@/hooks/use-user";
import { useState, useCallback } from "react";
import { FriendRequestNotification, FriendRequestsModal } from "@/features/profile/components";
import { useFriendRequests } from "@/features/profile/hooks/use-friend-requests";

export default function Home() {
  const { user } = useUser();
  const { profile } = useProfile(user?.id);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);

  // Load pending friend requests for the modal
  const { requests, loading, error, refetch } = useFriendRequests();

  const handleAccept = useCallback(async (requestId: string) => {
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
  }, [refetch]);

  const handleDecline = useCallback(async (requestId: string) => {
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
  }, [refetch]);
  return (
    <div className="space-y-6">
      <h1>Welcome, {profile?.displayName || "User"}</h1>

      {/* Friend Requests notification and modal */}
      <div>
        <FriendRequestNotification onOpenRequests={() => setIsRequestsOpen(true)} />
        <FriendRequestsModal
          isOpen={isRequestsOpen}
          onClose={() => setIsRequestsOpen(false)}
          requests={requests}
          onAccept={handleAccept}
          onDecline={handleDecline}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
