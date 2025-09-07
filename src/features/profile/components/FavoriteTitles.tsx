"use client";

import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { Film, Tv } from "lucide-react";

interface FavoriteTitlesProps {
  titles: string[];
}

export function FavoriteTitles({ titles }: FavoriteTitlesProps) {
  if (titles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="w-5 h-5 text-accent" />
            Favorite Titles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No favorite titles added yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="w-5 h-5 text-accent" />
          Favorite Titles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {titles.map((title, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                {/* Randomly assign movie or TV icon for demo */}
                {index % 2 === 0 ? (
                  <Film className="w-4 h-4 text-accent" />
                ) : (
                  <Tv className="w-4 h-4 text-accent" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{title}</p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {index % 2 === 0 ? "Movie" : "TV Show"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}