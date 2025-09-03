"use client";

import React from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type {
  HabitatWithMembership,
  HabitatMember,
} from "../domain/habitats.types";
import { useUser } from "@/hooks/use-user";
import { User } from "lucide-react";
import { useProfile } from "@/features/profile/hooks/use-profile";

interface HabitatInfoProps {
  habitat: HabitatWithMembership;
  members: HabitatMember[];
  onlineMembers: HabitatMember[];
  onViewAllMembers?: () => void;
  className?: string;
}

function MemberAvatar({
  member,
  isOnline = false,
}: {
  member: HabitatMember;
  isOnline?: boolean;
}) {
  const { profile } = useProfile(member.user_id);
  if (!profile) {
    return null;
  }
  return (
    <div className="relative">
      {profile.avatarUrl ? (
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-background">
          <Image
            src={profile.avatarUrl}
            alt={`${profile.displayName || "Member"} avatar`}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="flex gap-3 items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-background flex items-center justify-center">
            {profile.displayName ? (
              <span className="text-xs font-medium text-primary">
                {profile.displayName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User />
            )}
          </div>

          <p>You</p>
        </div>
      )}

      {/* Online indicator */}
      {isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
      )}
    </div>
  );
}

export function HabitatInfo({
  habitat,
  members,
  onlineMembers,
  onViewAllMembers,
}: HabitatInfoProps) {
  const createdDate = new Date(habitat.created_at);
  const onlineMemberIds = new Set(onlineMembers.map((m) => m.user_id));
  const recentMembers = members.slice(0, 8); // Show up to 8 member avatars

  return (
    <div className="space-y-6">
      {/* Habitat Metadata */}
      <Card className="bg-primary-surface border-border/50 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Created Date */}
          <div className="mb-6">
            <div className="text-xs text-muted-foreground mb-1">Created in</div>
            <div className="text-sm font-medium text-foreground">
              {createdDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>

          {/* Tags */}
          {habitat.tags.length > 0 && (
            <div className="mb-6">
              <div className="text-xs text-muted-foreground mb-3">Tags</div>
              <div className="flex flex-wrap gap-2">
                {habitat.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-6 py-3 text-xs bg-card text-foreground rounded-[10px] cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members Section */}
      <Card className="bg-primary-surface">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Members</span>
            {onViewAllMembers && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewAllMembers}
                className="text-muted-foreground"
              >
                View all
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Member Avatars */}
          {recentMembers.length > 0 ? (
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {recentMembers.map((member) => (
                  <div
                    key={member.user_id}
                    className="group relative"
                    title={`Member ${member.user_id.slice(0, 8)}`}
                  >
                    <MemberAvatar
                      member={member}
                      isOnline={onlineMemberIds.has(member.user_id)}
                    />
                  </div>
                ))}

                {/* Show more indicator */}
                {habitat.member_count > recentMembers.length && (
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      +{habitat.member_count - recentMembers.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                No members to display
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
