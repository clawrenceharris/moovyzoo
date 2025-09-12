import { useState, useEffect } from 'react';
import { FriendRequest } from '../domain/profiles.types';

interface UseFriendRequestsResult {
  requests: FriendRequest[];
  count: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFriendRequests(): UseFriendRequestsResult {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/friends/requests');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch friend requests');
      }

      if (result.success) {
        setRequests(result.data.requests || []);
      } else {
        throw new Error(result.error || 'Failed to fetch friend requests');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    requests,
    count: requests.length,
    loading,
    error,
    refetch: fetchRequests,
  };
}