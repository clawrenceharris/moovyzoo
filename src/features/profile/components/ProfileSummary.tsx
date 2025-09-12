"use client";

import { Avatar, AvatarFallback, AvatarImage, Badge } from "@/components/ui";
import type { UserProfile } from "../domain/profiles.types";

interface ProfileSummaryProps {
  profile: UserProfile;
  className?: string;
}

export function ProfileSummary({ profile, className = "" }: ProfileSummaryProps) {
  const displayName = profile.displayName || profile.username || "Anonymous User";
  const initials = displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Avatar className="w-10 h-10">
        <AvatarImage src={profile.avatarUrl} alt={displayName} />
        <AvatarFallback className="bg-accent/10 text-accent font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{displayName}</p>
        {profile.username && (
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
        )}
      </div>

      {!profile.isPublic && (
        <Badge variant="secondary" className="text-xs">
          Private
        </Badge>
      )}
    </div>
  );
}