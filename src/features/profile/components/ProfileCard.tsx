"use client";

import { Card, CardContent, Avatar, AvatarFallback, AvatarImage, Badge, Button } from "@/components/ui";
import { MessageCircle, UserPlus } from "lucide-react";
import type { UserProfile } from "../domain/profiles.types";

interface ProfileCardProps {
  profile: UserProfile;
  onViewProfile?: () => void;
  onSendMessage?: () => void;
  onAddFriend?: () => void;
  showActions?: boolean;
}

export function ProfileCard({ 
  profile, 
  onViewProfile, 
  onSendMessage, 
  onAddFriend,
  showActions = true 
}: ProfileCardProps) {
  const displayName = profile.displayName || profile.username || "Anonymous User";
  const initials = displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover:scale-[1.02] transition-transform duration-200 cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-2 border-accent/20">
            <AvatarImage src={profile.avatarUrl} alt={displayName} />
            <AvatarFallback className="text-lg font-bold bg-accent/10 text-accent">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1 truncate">{displayName}</h3>
            {profile.username && (
              <p className="text-sm text-muted-foreground mb-2">@{profile.username}</p>
            )}
            
            {profile.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{profile.bio}</p>
            )}

            {profile.favoriteGenres.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {profile.favoriteGenres.slice(0, 3).map((genre) => (
                  <Badge key={genre} variant="secondary" className="text-xs">
                    {genre}
                  </Badge>
                ))}
                {profile.favoriteGenres.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{profile.favoriteGenres.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {showActions && (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={onViewProfile}
                  className="flex-1"
                >
                  View Profile
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onSendMessage}
                  className="gap-1"
                >
                  <MessageCircle className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onAddFriend}
                  className="gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}