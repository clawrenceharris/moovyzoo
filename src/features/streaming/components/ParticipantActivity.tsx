"use client";

import { UserPlus, UserMinus, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface ParticipantActivityProps {
  recentJoins: string[];
  recentLeaves: string[];
  participantCount?: number;
  maxItems?: number;
  className?: string;
}

interface ActivityItem {
  id: string;
  type: "join" | "leave";
  userId: string;
  timestamp: number;
}

/**
 * Component to display recent participant activity (joins/leaves)
 * Shows animated notifications for real-time participant changes
 */
export function ParticipantActivity({
  recentJoins,
  recentLeaves,
  participantCount,
  maxItems = 5,
  className = "",
}: ParticipantActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Update activities when joins/leaves change
  useEffect(() => {
    const newActivities: ActivityItem[] = [];

    // Add recent joins
    recentJoins.forEach((userId) => {
      newActivities.push({
        id: `join-${userId}-${Date.now()}`,
        type: "join",
        userId,
        timestamp: Date.now(),
      });
    });

    // Add recent leaves
    recentLeaves.forEach((userId) => {
      newActivities.push({
        id: `leave-${userId}-${Date.now()}`,
        type: "leave",
        userId,
        timestamp: Date.now(),
      });
    });

    if (newActivities.length > 0) {
      setActivities((prev) => {
        const combined = [...newActivities, ...prev];
        // Sort by timestamp (newest first) and limit
        return combined
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, maxItems);
      });
    }
  }, [recentJoins, recentLeaves, maxItems]);

  // Auto-remove old activities
  useEffect(() => {
    const timer = setTimeout(() => {
      setActivities(
        (prev) =>
          prev.filter((activity) => Date.now() - activity.timestamp < 10000) // Remove after 10 seconds
      );
    }, 10000);

    return () => clearTimeout(timer);
  }, [activities]);

  if (activities.length === 0 && participantCount === undefined) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Participant count */}
      {participantCount !== undefined && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Users className="h-4 w-4" />
          <span>{participantCount} watching</span>
        </div>
      )}

      {/* Recent activity */}
      {activities.length > 0 && (
        <div className="space-y-1">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                animate-in slide-in-from-right-2 fade-in duration-300
                ${
                  activity.type === "join"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400"
                }
              `}
            >
              {activity.type === "join" ? (
                <UserPlus className="h-4 w-4" />
              ) : (
                <UserMinus className="h-4 w-4" />
              )}
              <span>
                <span className="font-medium">{activity.userId}</span>
                {activity.type === "join" ? " joined" : " left"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
