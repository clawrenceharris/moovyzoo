"use client";

import { Avatar, AvatarFallback, AvatarImage, Button, Badge } from "@/components/ui";
import { Edit, Globe, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import type { UserProfile } from "../domain/profiles.types";

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile?: boolean;
  onEditClick?: () => void;
}

export function ProfileHeader({ profile, isOwnProfile = false, onEditClick }: ProfileHeaderProps) {
  const router = useRouter();
  const displayName = profile.displayName || profile.username || "Anonymous User";
  const initials = displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-card border border-border/50 rounded-xl p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar */}
        <Avatar className="w-24 h-24 border-4 border-accent/20">
          <AvatarImage src={profile.avatarUrl} alt={displayName} />
          <AvatarFallback className="text-xl font-bold bg-accent/10 text-accent">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{displayName}</h1>
              {profile.username && (
                <p className="text-muted-foreground mb-2">@{profile.username}</p>
              )}
              {profile.quote && (
                <p className="text-lg text-muted-foreground italic mb-3">"{profile.quote}"</p>
              )}
              {profile.bio && (
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Badge variant={profile.isPublic ? "default" : "secondary"} className="gap-1">
                {profile.isPublic ? (
                  <>
                    <Globe className="w-3 h-3" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3" />
                    Private
                  </>
                )}
              </Badge>
              
              {isOwnProfile && (
                <Button 
                  onClick={() => router.push("/profile/edit")} 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Favorite Genres */}
          {profile.favoriteGenres.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Favorite Genres</h3>
              <div className="flex flex-wrap gap-2">
                {profile.favoriteGenres.slice(0, 6).map((genre) => (
                  <Badge key={genre} variant="secondary" className="text-xs">
                    {genre}
                  </Badge>
                ))}
                {profile.favoriteGenres.length > 6 && (
                  <Badge variant="secondary" className="text-xs">
                    +{profile.favoriteGenres.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}