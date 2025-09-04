"use client";

import React from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type {
  HabitatWithMembership,
  HabitatMember,
} from "../domain/habitats.types";

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
  // For now, we'll use a placeholder since we don't have profile data in the member object
  // In a real implementation, this would include profile data
  const displayName = `Member ${member.user_id.slice(0, 8)}`;
  const avatarUrl = null; // TODO: Get from profile data

  return (
    <div className="relative">
      {avatarUrl ? (
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-background">
          <Image
            src={avatarUrl}
            alt={displayName}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-background flex items-center justify-center">
          <span className="text-xs font-medium text-primary">
            {displayName.charAt(0).toUpperCase()}
          </span>
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
          <div className="text-center mb-6">
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
                    className="px-3 py-1 text-xs bg-accent/10 text-accent rounded-full border border-accent/20 hover:bg-accent/20 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Members Section */}
          <div className="mb-6">
            <div className="text-xs text-muted-foreground mb-3">Members</div>

            {/* Online/Total Stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                <span className="text-sm font-medium text-accent">
                  Members Online: {onlineMembers.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-foreground"></div>
                <span className="text-sm font-medium text-foreground">
                  Total Members: {habitat.member_count}
                </span>
              </div>
            </div>

            {/* Member Avatars */}
            {recentMembers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recentMembers.slice(0, 6).map((member) => (
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
                {habitat.member_count > 6 && (
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      +{habitat.member_count - 6}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Habitat Admin */}
          <div className="mb-6">
            <div className="text-xs text-muted-foreground mb-3">
              Habitat Admin
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-background flex items-center justify-center">
                <span className="text-sm font-medium text-primary">RS</span>
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  Rumble Shetty
                </div>
                <div className="text-xs text-muted-foreground">From India</div>
              </div>
            </div>
          </div>

          {/* Habitat Moderator */}
          <div>
            <div className="text-xs text-muted-foreground mb-3">
              Habitat Moderator
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-background flex items-center justify-center">
                <span className="text-sm font-medium text-primary">BJ</span>
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  B. Jordan
                </div>
                <div className="text-xs text-muted-foreground">From USA</div>
              </div>
            </div>
          </div>
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
          {/* Online Members Count */}
          {onlineMembers.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-green-600 dark:text-green-400 font-medium">
                {onlineMembers.length} online now
              </span>
            </div>
          )}

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

              {/* Recent Activity */}
              <div className="text-xs text-muted-foreground">
                <p>
                  {onlineMembers.length > 0
                    ? `${onlineMembers.length} members active recently`
                    : "No recent activity"}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-muted/50 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">
                No members to display
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ongoing Events */}
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Ongoing Events
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Poll Event */}
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">Poll</div>
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-primary mt-1 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground mb-1">
                    Favourite Sci-Fi AI Character?
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Started by Samira
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trivia Event */}
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">Trivia</div>
            <div className="p-3 bg-accent-yellow/5 border border-accent-yellow/20 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-accent-yellow mt-1 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground mb-1">
                    Game of Thrones Trivia Night
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Time left: 02:23:47
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
