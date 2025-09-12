"use client";

import { Card, CardContent, Avatar, AvatarFallback, AvatarImage, Badge, Button } from "@/components/ui";
import { MessageCircle, UserPlus, UserCheck, Clock } from "lucide-react";
import type { UserProfile, ProfileWithFriendStatus } from "../domain/profiles.types";

interface ProfileCardProps {
  profile: UserProfile | ProfileWithFriendStatus;
  onViewProfile?: () => void;
  onSendMessage?: () => void;
  onAddFriend?: () => void;
  onFriendAction?: (action: 'add' | 'accept' | 'decline', profileId: string) => void;
  showActions?: boolean;
}

export function ProfileCard({ 
  profile, 
  onViewProfile, 
  onSendMessage, 
  onAddFriend,
  onFriendAction,
  showActions = true 
}: ProfileCardProps) {
  const displayName = profile.displayName || profile.username || "Anonymous User";
  const initials = displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Check if profile has friend status (ProfileWithFriendStatus)
  const friendStatus = 'friendStatus' in profile ? profile.friendStatus : null;

  const handleFriendAction = (action: 'add' | 'accept' | 'decline') => {
    if (onFriendAction) {
      onFriendAction(action, profile.userId);
    } else if (action === 'add' && onAddFriend) {
      // Fallback to legacy onAddFriend prop
      onAddFriend();
    }
  };

  const renderFriendButton = () => {
    if (!friendStatus) {
      // Legacy behavior - show add friend button
      return (
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleFriendAction('add')}
          className="gap-1"
        >
          <UserPlus className="w-3 h-3" />
        </Button>
      );
    }

    switch (friendStatus.status) {
      case 'none':
        return (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleFriendAction('add')}
            className="gap-1"
          >
            <UserPlus className="w-3 h-3" />
            Add Friend
          </Button>
        );
      
      case 'pending_sent':
        return (
          <Button 
            size="sm" 
            variant="outline" 
            disabled
            className="gap-1 opacity-60"
          >
            <Clock className="w-3 h-3" />
            Request Sent
          </Button>
        );
      
      case 'pending_received':
        return (
          <div className="flex gap-1 shrink-0">
            <Button 
              size="sm" 
              onClick={() => handleFriendAction('accept')}
              className="gap-1 whitespace-nowrap"
              variant={"primary"}
            >
              <UserCheck className="w-3 h-3" />
              Accept
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleFriendAction('decline')}
              className="whitespace-nowrap"
            >
              Decline
            </Button>
          </div>
        );
      
      case 'friends':
        return (
          <Button 
            size="sm" 
            variant="outline" 
            disabled
            className="gap-1 opacity-60"
          >
            <UserCheck className="w-3 h-3" />
            Friends
          </Button>
        );
      
      case 'blocked':
        return null; // Don't show any button for blocked users
      
      default:
        return null;
    }
  };

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
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={onViewProfile}
                  className="text-gray-400 font-normal whitespace-nowrap"
                  variant="outline"
                  
                >
                  View Profile
                </Button>
                {onSendMessage && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={onSendMessage}
                    className="gap-1"
                  >
                    <MessageCircle className="w-3 h-3" />
                  </Button>
                )}
                {renderFriendButton()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}