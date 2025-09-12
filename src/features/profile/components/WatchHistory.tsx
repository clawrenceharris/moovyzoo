"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Eye, Play, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { WatchHistoryEntry } from "../domain/profiles.types";

interface WatchHistoryProps {
  watchHistory?: WatchHistoryEntry[];
  isOwnProfile?: boolean;
}

const statusConfig = {
  watched: {
    icon: Eye,
    color: "bg-green-500",
    label: "Watched",
    variant: "outline" as const,
  },
  watching: {
    icon: Play,
    color: "bg-blue-500", 
    label: "Watching",
    variant: "secondary" as const,
  },
  dropped: {
    icon: X,
    color: "bg-red-500",
    label: "Dropped", 
    variant: "destructive" as const,
  },
};

export function WatchHistory({ watchHistory = [], isOwnProfile = false }: WatchHistoryProps) {
  if (watchHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            {isOwnProfile ? "Your Watch History" : "Recent Watch Activity"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {isOwnProfile ? "No watch history yet" : "No recent activity"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent" />
          {isOwnProfile ? "Your Watch History" : "Recent Watch Activity"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {watchHistory.map((entry) => {
            const config = statusConfig[entry.status];
            const IconComponent = config.icon;
            
            return (
              <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                {/* Poster placeholder */}
                <div className="w-12 h-16 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                  {entry.posterUrl ? (
                    <img 
                      src={entry.posterUrl} 
                      alt={entry.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                      <Play className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h4 className="font-medium text-foreground line-clamp-1">{entry.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={config.variant} className="text-xs gap-1">
                          <IconComponent className="w-3 h-3" />
                          {config.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {entry.mediaType === 'movie' ? 'Movie' : 'TV Show'}
                        </Badge>
                      </div>
                    </div>
                    {entry.rating && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{entry.rating}/10</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(entry.watchedAt, { addSuffix: true })}
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