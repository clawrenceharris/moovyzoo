"use client";

import { useState } from "react";
import type { FriendStatus } from "../domain/profiles.types";

interface UseFriendActionsProps {
  userId: string;
  initialFriendStatus: FriendStatus;
  onStatusChange?: (newStatus: FriendStatus) => void;
}

export function useFriendActions({ userId, initialFriendStatus, onStatusChange }: UseFriendActionsProps) {
  const [friendStatus, setFriendStatus] = useState<FriendStatus>(initialFriendStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendFriendRequest = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiverId: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send friend request');
      }

      const newStatus: FriendStatus = {
        status: 'pending_sent',
        friendshipId: undefined, // Will be set by server response if needed
      };

      setFriendStatus(newStatus);
      onStatusChange?.(newStatus);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send friend request';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFriend = async () => {
    if (isLoading || !friendStatus.friendshipId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/friends/${friendStatus.friendshipId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove friend');
      }

      const newStatus: FriendStatus = {
        status: 'none',
      };

      setFriendStatus(newStatus);
      onStatusChange?.(newStatus);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove friend';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptPendingRequest = async () => {
    if (isLoading) return;
    if (friendStatus.status !== 'pending_received' || !friendStatus.friendshipId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/friends/${friendStatus.friendshipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept friend request');
      }

      const newStatus: FriendStatus = {
        status: 'friends',
        friendshipId: data?.data?.id ?? friendStatus.friendshipId,
      };
      setFriendStatus(newStatus);
      onStatusChange?.(newStatus);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept friend request';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    switch (friendStatus.status) {
      case 'none':
        return 'Add Friend';
      case 'pending_sent':
        return 'Request Sent';
      case 'pending_received':
        return 'Accept Request';
      case 'friends':
        return 'Remove Friend';
      case 'blocked':
        return 'Blocked';
      default:
        return 'Add Friend';
    }
  };

  const getButtonVariant = () => {
    switch (friendStatus.status) {
      case 'none':
        return 'primary' as const;
      case 'pending_sent':
        return 'secondary' as const;
      case 'pending_received':
        return 'secondary' as const;
      case 'friends':
        return 'outline' as const;
      case 'blocked':
        return 'destructive' as const;
      default:
        return 'default' as const;
    }
  };

  const isButtonDisabled = () => {
    return isLoading || friendStatus.status === 'pending_sent' || friendStatus.status === 'blocked';
  };

  const handleButtonClick = () => {
    switch (friendStatus.status) {
      case 'none':
        sendFriendRequest();
        break;
      case 'friends':
        removeFriend();
        break;
      case 'pending_received':
  acceptPendingRequest();
        break;
      default:
        break;
    }
  };

  return {
    friendStatus,
    isLoading,
    error,
    sendFriendRequest,
    removeFriend,
  acceptPendingRequest,
    getButtonText,
    getButtonVariant,
    isButtonDisabled,
    handleButtonClick,
  };
}