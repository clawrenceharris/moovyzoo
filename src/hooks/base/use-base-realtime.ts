"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase/client";
import { normalizeError } from "@/utils/normalize-error";

interface UseBaseRealtimeState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

interface UseBaseRealtimeCallbacks<T = any> {
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: string) => void;
}

interface UseBaseRealtimeOptions {
  autoReconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

interface UseBaseRealtimeParams<T = any> {
  channelName: string;
  tableName: string;
  filter?: string;
  callbacks: UseBaseRealtimeCallbacks<T>;
  options?: UseBaseRealtimeOptions;
  enabled?: boolean;
}

/**
 * Base hook for managing real-time Supabase connections
 * Handles connection management, subscriptions, and error recovery
 * Can be extended for specific real-time use cases
 */
export function useBaseRealtime<T = any>({
  channelName,
  tableName,
  filter,
  callbacks,
  options = {},
  enabled = true,
}: UseBaseRealtimeParams<T>) {
  const {
    autoReconnect = true,
    reconnectDelay = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const [state, setState] = useState<UseBaseRealtimeState>({
    connected: false,
    connecting: false,
    error: null,
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);

  // Store latest callbacks in refs to avoid dependency issues
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // Clear any existing reconnect timeout
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Connect to real-time channel
  const connect = useCallback(async () => {
    if (!enabled || isUnmountedRef.current) {
      return;
    }

    // Don't connect if already connected
    if (channelRef.current) {
      return;
    }

    setState((prev) => ({ ...prev, connecting: true, error: null }));

    try {
      // Create channel
      const channel = supabase.channel(channelName);

      // Set up postgres change listeners
      const baseConfig = {
        schema: "public",
        table: tableName,
        ...(filter && { filter }),
      };

      channel
        .on(
          "postgres_changes",
          { ...baseConfig, event: "INSERT" },
          (payload: RealtimePostgresChangesPayload<T>) => {
            callbacksRef.current.onInsert?.(payload);
          }
        )
        .on(
          "postgres_changes",
          { ...baseConfig, event: "UPDATE" },
          (payload: RealtimePostgresChangesPayload<T>) => {
            callbacksRef.current.onUpdate?.(payload);
          }
        )
        .on(
          "postgres_changes",
          { ...baseConfig, event: "DELETE" },
          (payload: RealtimePostgresChangesPayload<T>) => {
            callbacksRef.current.onDelete?.(payload);
          }
        );

      // Handle channel status changes
      channel.subscribe((status, err) => {
        if (isUnmountedRef.current) return;

        switch (status) {
          case "SUBSCRIBED":
            channelRef.current = channel;
            reconnectAttemptsRef.current = 0;
            setState((prev) => ({
              ...prev,
              connected: true,
              connecting: false,
            }));
            callbacksRef.current.onConnectionChange?.(true);
            break;
          case "CHANNEL_ERROR":
          case "TIMED_OUT":
          case "CLOSED":
            channelRef.current = null;
            setState((prev) => ({
              ...prev,
              connected: false,
              connecting: false,
            }));
            callbacksRef.current.onConnectionChange?.(false);

            if (err) {
              const normalizedError = normalizeError(err);
              setState((prev) => ({ ...prev, error: normalizedError.message }));
              callbacksRef.current.onError?.(normalizedError.message);
            }

            // Attempt reconnection if enabled
            if (
              autoReconnect &&
              reconnectAttemptsRef.current < maxReconnectAttempts
            ) {
              clearReconnectTimeout();
              reconnectTimeoutRef.current = setTimeout(() => {
                if (!isUnmountedRef.current) {
                  reconnectAttemptsRef.current += 1;
                  connect();
                }
              }, reconnectDelay);
            }
            break;
        }
      });
    } catch (error) {
      if (!isUnmountedRef.current) {
        const normalizedError = normalizeError(error);
        setState((prev) => ({
          ...prev,
          error: normalizedError.message,
          connecting: false,
        }));
        callbacksRef.current.onError?.(normalizedError.message);
      }
    }
  }, [
    enabled,
    channelName,
    tableName,
    filter,
    autoReconnect,
    maxReconnectAttempts,
    reconnectDelay,
    clearReconnectTimeout,
  ]);

  // Disconnect from real-time channel
  const disconnect = useCallback(() => {
    clearReconnectTimeout();

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    setState((prev) => ({ ...prev, connected: false, connecting: false }));
    callbacksRef.current.onConnectionChange?.(false);
    reconnectAttemptsRef.current = 0;
  }, [clearReconnectTimeout]);

  // Manually reconnect
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [disconnect, connect]);

  // Clear error state
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Connect on mount and when dependencies change
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      disconnect();
    };
  }, [disconnect]);

  return {
    // State
    connected: state.connected,
    connecting: state.connecting,
    error: state.error,

    // Actions
    connect,
    disconnect,
    reconnect,
    clearError,

    // Status
    canReconnect: reconnectAttemptsRef.current < maxReconnectAttempts,
    reconnectAttempts: reconnectAttemptsRef.current,
  };
}

export type UseBaseRealtimeReturn = ReturnType<typeof useBaseRealtime>;
export type { UseBaseRealtimeCallbacks, UseBaseRealtimeOptions };
