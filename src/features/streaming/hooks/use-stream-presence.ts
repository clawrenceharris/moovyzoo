"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import type { StreamParticipant } from "../domain/stream.types";

interface PresenceState {
  user_id: string;
  display_name: string;
  avatar_url?: string;
  online_at: string;
}

/**
 * Hook to track active participants in a stream using Supabase Presence
 */
export function useStreamPresence(
  streamId: string,
  currentUserId: string,
  participants: StreamParticipant[]
) {
  const [activeParticipants, setActiveParticipants] = useState<
    StreamParticipant[]
  >([]);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!streamId || !currentUserId) return;

    // Clean up existing channel
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    // Find current user's profile info
    const currentUserParticipant = participants.find(
      (p) => p.user_id === currentUserId
    );
    const currentUserProfile = currentUserParticipant?.profile;

    // Create presence channel
    const channel = supabase.channel(`stream-presence:${streamId}`, {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    });

    // Track presence state
    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState();

        // Convert presence state to active participants
        const activeUserIds = new Set<string>();
        Object.values(presenceState).forEach((presences: any) => {
          presences.forEach((presence: PresenceState) => {
            activeUserIds.add(presence.user_id);
          });
        });

        // Filter participants to only include active ones
        const activeParticipantsList = participants.filter((participant) =>
          activeUserIds.has(participant.user_id)
        );

        setActiveParticipants(activeParticipantsList);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("User joined:", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("User left:", key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Track current user's presence
          await channel.track({
            user_id: currentUserId,
            display_name:
              currentUserProfile?.display_name ||
              `User ${currentUserId.slice(0, 8)}`,
            avatar_url: currentUserProfile?.avatar_url,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount or dependency change
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [streamId, currentUserId, participants]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, []);

  return {
    activeParticipants,
    totalActiveCount: activeParticipants.length,
  };
}
