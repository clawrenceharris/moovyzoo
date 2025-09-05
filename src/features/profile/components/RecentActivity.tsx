"use client";

import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { Activity, MessageCircle, Trophy, Users, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: "habitat_joined" | "race_won" | "badge_earned" | "discussion_started" | "party_created";
  title: string;
  description?: string;
  timestamp: Date;
}

interface RecentActivityProps {
  activities?: ActivityItem[];
}

// Mock data for demonstration
const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "race_won",
    title: "Won Binge Race",
    description: "Stranger Things Season 4",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: "2", 
    type: "habitat_joined",
    title: "Joined Habitat",
    description: "Sci-Fi Space Station",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: "3",
    type: "badge_earned",
    title: "Earned Badge",
    description: "Marathon Master",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
  },
  {
    id: "4",
    type: "discussion_started",
    title: "Started Discussion",
    description: "Best plot twists in sci-fi",
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
  },
];

const activityConfig = {
  habitat_joined: {
    icon: Users,
    color: "bg-accent",
    label: "Joined Habitat",
  },
  race_won: {
    icon: Zap,
    color: "bg-accent",
    label: "Won Race",
  },
  badge_earned: {
    icon: Trophy,
    color: "bg-primary",
    label: "Earned Badge",
  },
  discussion_started: {
    icon: MessageCircle,
    color: "bg-muted-foreground",
    label: "Started Discussion",
  },
  party_created: {
    icon: Users,
    color: "bg-accent-pink",
    label: "Created Party",
  },
};

export function RecentActivity({ activities = mockActivities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No recent activity
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const config = activityConfig[activity.type];
            const IconComponent = config.icon;
            
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className={`${config.color} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground">{activity.title}</p>
                    <Badge variant="secondary" className="text-xs">
                      {config.label}
                    </Badge>
                  </div>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground mb-1">{activity.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}