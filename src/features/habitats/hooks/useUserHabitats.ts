"use client";

import { useState, useEffect, useCallback } from "react";
import { habitatsService } from "../domain/habitats.service";
import type { HabitatWithMembership } from "../domain/habitats.types";
import { normalizeError } from "@/utils/normalize-error";

interface UseUserHabitatsState {
  habitats: HabitatWithMembership[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook for fetching and managing user's joined habitats
 * Provides loading states, error handling, and refresh functionality
 */
export function useUserHabitats(userId: string | null) {
  const [state, setState] = useState<UseUserHabitatsState>({
    habitats: [],
    loading: false,
    error: null,
  });

  // Initial fetch on mount and when userId changes
  useEffect(() => {
    if (!userId) {
      setState({
        habitats: [],
        loading: false,
        error: null,
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const fetchHabitats = async () => {
      try {
        const habitats = await habitatsService.getUserJoinedHabitats(userId);
        setState({
          habitats,
          loading: false,
          error: null,
        });
      } catch (error) {
        const normalizedError = normalizeError(error);

        setState((prev) => ({
          ...prev,
          loading: false,
          error: normalizedError.message,
        }));
      }
    };

    fetchHabitats();
  }, [userId]);

  // Join a habitat and refresh the list
  const joinHabitat = useCallback(
    async (habitatId: string) => {
      if (!userId) {
        throw new Error("User must be logged in to join habitats");
      }

      try {
        await habitatsService.joinHabitat(habitatId, userId);
        // Refresh the habitats list after joining
        const habitats = await habitatsService.getUserJoinedHabitats(userId);
        setState({
          habitats,
          loading: false,
          error: null,
        });
      } catch (error) {
        const normalizedError = normalizeError(error);
        throw new Error(normalizedError.message);
      }
    },
    [userId]
  );

  // Leave a habitat and refresh the list
  const leaveHabitat = useCallback(
    async (habitatId: string) => {
      if (!userId) {
        throw new Error("User must be logged in to leave habitats");
      }

      try {
        await habitatsService.leaveHabitat(habitatId, userId);
        // Refresh the habitats list after leaving
        const habitats = await habitatsService.getUserJoinedHabitats(userId);
        setState({
          habitats,
          loading: false,
          error: null,
        });
      } catch (error) {
        const normalizedError = normalizeError(error);
        throw new Error(normalizedError.message);
      }
    },
    [userId]
  );

  // Clear error state
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Refresh habitats manually
  const refresh = useCallback(() => {
    if (!userId) {
      setState({
        habitats: [],
        loading: false,
        error: null,
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const refreshHabitats = async () => {
      try {
        const habitats = await habitatsService.getUserJoinedHabitats(userId);
        setState({
          habitats,
          loading: false,
          error: null,
        });
      } catch (error) {
        const normalizedError = normalizeError(error);

        setState((prev) => ({
          ...prev,
          loading: false,
          error: normalizedError.message,
        }));
      }
    };

    refreshHabitats();
  }, [userId]);

  return {
    // State
    habitats: state.habitats,
    loading: state.loading,
    error: state.error,

    // Actions
    joinHabitat,
    leaveHabitat,
    refresh,
    clearError,
  };
}

export type UseUserHabitatsReturn = ReturnType<typeof useUserHabitats>;
