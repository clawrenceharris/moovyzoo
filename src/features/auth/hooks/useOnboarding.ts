"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "./useAuth";
import { profilesService } from "../../profile/domain/profiles.service";
import {
  OnboardingData,
  OnboardingState,
  OnboardingStep,
} from "../domain/auth.types";
import { AppErrorCode } from "@/types/error";

interface UseOnboardingOptions {
  onComplete?: (data: OnboardingData) => void;
  onSkip?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for managing onboarding flow state and completion
 */
export function useOnboarding(options: UseOnboardingOptions = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [state, setState] = useState<OnboardingState>({
    currentStep: OnboardingStep.WELCOME,
    data: {
      favoriteGenres: [],
      displayName: "",
      avatarUrl: "",
    },
    isComplete: false,
    canSkip: false,
  });

  // Mutation for completing onboarding
  const completeOnboardingMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      if (!user) {
        throw new Error(AppErrorCode.AUTH_USER_NOT_FOUND);
      }

      const result = await profilesService.updateProfile(user.id, {
        onboardingCompleted: true,
        favoriteGenres: data.favoriteGenres,
        avatarUrl: data.avatarUrl,
        displayName: data.displayName,
      });

      return result;
    },
    onSuccess: (profileData) => {
      // Invalidate profile queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });

      // Mark onboarding as complete
      setState((prev: OnboardingState) => ({ ...prev, isComplete: true }));

      // Call success callback
      options.onComplete?.(state.data as OnboardingData);
      console.log("Successfully completed onboarding: " + profileData);
    },
    onError: (error) => {
      console.error("Error completing onboarding:", error);
      options.onError?.(error as Error);
    },
  });

  // Update onboarding data
  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setState((prev: OnboardingState) => ({
      ...prev,
      data: { ...prev.data, ...updates },
    }));
  }, []);

  // Move to next step
  const nextStep = useCallback(() => {
    const steps = [
      OnboardingStep.WELCOME,
      OnboardingStep.DISPLAY_NAME,
      OnboardingStep.GENRE_SELECTION,
      OnboardingStep.AVATAR,
    ];

    const currentIndex = steps.indexOf(state.currentStep);
    const nextIndex = currentIndex + 1;

    if (nextIndex < steps.length) {
      setState((prev: OnboardingState) => ({
        ...prev,
        currentStep: steps[nextIndex],
        canSkip: steps[nextIndex] !== OnboardingStep.WELCOME,
      }));
    }
  }, [state.currentStep]);

  // Move to previous step
  const previousStep = useCallback(() => {
    const steps = [
      OnboardingStep.WELCOME,
      OnboardingStep.DISPLAY_NAME,
      OnboardingStep.GENRE_SELECTION,
      OnboardingStep.AVATAR,
    ];

    const currentIndex = steps.indexOf(state.currentStep);
    const prevIndex = currentIndex - 1;

    if (prevIndex >= 0) {
      setState((prev: OnboardingState) => ({
        ...prev,
        currentStep: steps[prevIndex],
        canSkip: steps[prevIndex] !== OnboardingStep.WELCOME,
      }));
    }
  }, [state.currentStep]);

  // Go to specific step
  const goToStep = useCallback((step: OnboardingStep) => {
    setState((prev: OnboardingState) => ({
      ...prev,
      currentStep: step,
      canSkip: step !== OnboardingStep.WELCOME,
    }));
  }, []);

  // Complete onboarding
  const completeOnboarding = useCallback(
    async (data?: OnboardingData) => {
      const finalData = data || (state.data as OnboardingData);

      try {
        // Validate required fields
        if (!finalData.displayName || finalData.displayName.trim().length < 2) {
          throw new Error(AppErrorCode.VALIDATION_INVALID_DISPLAY_NAME);
        }

        if (
          !finalData.favoriteGenres ||
          finalData.favoriteGenres.length === 0
        ) {
          throw new Error(AppErrorCode.VALIDATION_INVALID_GENRES);
        }

        await completeOnboardingMutation.mutateAsync(finalData);
      } catch (error) {
        console.error("Error in completeOnboarding:", error);
        throw error;
      }
    },
    [state.data, completeOnboardingMutation]
  );

  // Skip onboarding
  const skipOnboarding = useCallback(() => {
    setState((prev: OnboardingState) => ({ ...prev, isComplete: true }));
    options.onSkip?.();
  }, [options]);

  // Reset onboarding state
  const resetOnboarding = useCallback(() => {
    setState({
      currentStep: OnboardingStep.WELCOME,
      data: {
        favoriteGenres: [],
        displayName: "",
        avatarUrl: "",
      },
      isComplete: false,
      canSkip: false,
    });
  }, []);

  // Validation helpers
  const validateStep = useCallback(
    (step: OnboardingStep): boolean => {
      switch (step) {
        case OnboardingStep.WELCOME:
          return true;

        case OnboardingStep.DISPLAY_NAME:
          return !!(
            state.data.displayName &&
            state.data.displayName.trim().length >= 2 &&
            state.data.displayName.length <= 50 &&
            /^[a-zA-Z0-9\s_-]+$/.test(state.data.displayName)
          );

        case OnboardingStep.GENRE_SELECTION:
          return !!(
            state.data.favoriteGenres &&
            state.data.favoriteGenres.length > 0 &&
            state.data.favoriteGenres.length <= 10
          );

        case OnboardingStep.AVATAR:
          // Avatar is optional, but if provided, should be valid URL
          if (!state.data.avatarUrl || state.data.avatarUrl.trim() === "") {
            return true;
          }
          try {
            new URL(state.data.avatarUrl);
            return true;
          } catch {
            return false;
          }

        default:
          return false;
      }
    },
    [state.data]
  );

  const canProceedFromCurrentStep = validateStep(state.currentStep);

  const isValidForCompletion =
    validateStep(OnboardingStep.DISPLAY_NAME) &&
    validateStep(OnboardingStep.GENRE_SELECTION) &&
    validateStep(OnboardingStep.AVATAR);

  // Progress calculation
  const steps = [
    OnboardingStep.WELCOME,
    OnboardingStep.DISPLAY_NAME,
    OnboardingStep.GENRE_SELECTION,
    OnboardingStep.AVATAR,
  ];

  const currentStepIndex = steps.indexOf(state.currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return {
    // State
    ...state,
    progress,

    // Validation
    canProceedFromCurrentStep,
    isValidForCompletion,
    validateStep,

    // Actions
    updateData,
    nextStep,
    previousStep,
    goToStep,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,

    // Loading states
    isCompleting: completeOnboardingMutation.isPending,
    completionError: completeOnboardingMutation.error,

    // Computed values
    isFirstStep: state.currentStep === OnboardingStep.WELCOME,
    isLastStep: state.currentStep === OnboardingStep.AVATAR,
    totalSteps: steps.length,
    currentStepIndex: currentStepIndex + 1,
  };
}

/**
 * Hook for checking if user needs onboarding
 */
export function useOnboardingStatus() {
  const { user } = useAuth();

  // This would typically check the user's profile to see if onboarding is complete
  // For now, we'll assume new users need onboarding
  const needsOnboarding = !!user && !user.emailVerified; // Simplified logic

  return {
    needsOnboarding,
    isNewUser: !!user && !user.emailVerified,
  };
}
