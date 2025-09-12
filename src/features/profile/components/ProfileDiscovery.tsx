"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileCard } from "./ProfileCard";
import { LoadingState, EmptyState } from "@/components/states";
import { Button } from "@/components/ui";
import { RefreshCw, Users } from "lucide-react";
import type { ProfileWithFriendStatus } from "../domain/profiles.types";

interface ProfileDiscoveryProps {
  initialProfiles?: ProfileWithFriendStatus[];
  initialPagination?: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface DiscoveryResponse {
  profiles: ProfileWithFriendStatus[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export function ProfileDiscovery({ initialProfiles = [], initialPagination }: ProfileDiscoveryProps) {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileWithFriendStatus[]>(initialProfiles);
  const [pagination, setPagination] = useState(initialPagination || {
    limit: 20,
    offset: 0,
    hasMore: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial profiles if not provided and no initial pagination provided
  useEffect(() => {
    if (initialProfiles.length === 0 && !initialPagination) {
      loadProfiles(true);
    }
  }, []);

  const loadProfiles = async (isInitial = false) => {
    const currentOffset = isInitial ? 0 : pagination.offset + pagination.limit;
    
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    setError(null);

    try {
      const response = await fetch(`/api/profiles/discover?limit=${pagination.limit}&offset=${currentOffset}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load profiles');
      }

      const data: DiscoveryResponse = await response.json();

      if (isInitial) {
        setProfiles(data.profiles);
      } else {
        setProfiles(prev => [...prev, ...data.profiles]);
      }
      
      setPagination(data.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profiles';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    loadProfiles(true);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && pagination.hasMore) {
      loadProfiles(false);
    }
  };

  const handleViewProfile = (profileId: string) => {
    router.push(`/profile/${profileId}`);
  };

  const handleFriendAction = async (action: 'add' | 'accept' | 'decline', profileId: string) => {
    try {
      let response: Response;

      switch (action) {
        case 'add':
          // Optimistically update UI to show "Request Sent" immediately
          setProfiles(prev => prev.map(profile => {
            // profileId here is expected to be the target user's userId
            if ('userId' in profile && profile.userId === profileId) {
              return {
                ...profile,
                friendStatus: { status: 'pending_sent' },
              } as ProfileWithFriendStatus;
            }
            return profile;
          }));

          response = await fetch('/api/friends', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ receiverId: profileId }),
          });

          // Treat 200..299 as success. For conflict (already exists), keep optimistic state silently.
          if (!response.ok) {
            // If the request already exists (idempotency), do not surface an error or roll back UI
            if (response.status === 409) {
              return; // keep optimistic pending_sent
            }
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to ${action} friend request`);
          }
          break;
        
        case 'accept':
        case 'decline':
          // For accept/decline, we need the friendship ID
          // This would typically be handled in the friend requests modal
          // For now, we'll just refresh the profiles
          await handleRefresh();
          return;
        
        default:
          return;
      }
      // No-op: optimistic update already applied for 'add'

    } catch (err) {
      // For other errors, we could revert optimistic change, but prefer to avoid flicker.
      // You might want to show a toast notification here
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-muted rounded w-48 mb-2"></div>
            <div className="h-5 bg-muted rounded w-64"></div>
          </div>
          <div className="h-10 bg-muted rounded w-24"></div>
        </div>
        <LoadingState variant="grid" count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        variant="card"
        title="Unable to Load Profiles"
        description={error}
        actionLabel="Try Again"
        onAction={handleRefresh}
        icon={<Users className="w-12 h-12 text-muted-foreground" />}
      />
    );
  }

  if (profiles.length === 0) {
    return (
      <EmptyState
        variant="card"
        title="No Profiles Found"
        description="There are no public profiles to discover at the moment. Check back later or invite friends to join Zoovie!"
        actionLabel="Refresh"
        onAction={handleRefresh}
        icon={<Users className="w-12 h-12 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Discover Profiles</h1>
          <p className="text-muted-foreground">Connect with other movie and TV enthusiasts</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Profiles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onViewProfile={() => handleViewProfile(profile.userId)}
            onFriendAction={handleFriendAction}
            showActions={true}
          />
        ))}
      </div>

      {/* Load more button */}
      {pagination.hasMore && (
        <div className="flex justify-center pt-6">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="gap-2"
          >
            {isLoadingMore ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Profiles'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}