"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useProfile } from "@/features/profile/hooks/useProfile";

export type OnboardingData = {
  displayName: string;
  favoriteGenres: string[];
  quote: string;
  avatarUrl: string;
  userId: string;
  email: string;
  username: string;
};

interface OnboardingContextType {
  data: OnboardingData;
  currentStep: number;
  totalSteps: number;
  progress: number;
  updateData: (u: Partial<OnboardingData>) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (n: number) => void;
  skipOnboarding: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const TOTAL_STEPS = 3;
  const [data, setData] = useState<OnboardingData>({
    displayName: "",
    favoriteGenres: [],
    quote: "",
    avatarUrl: "",
    userId: "",
    email: "",
    username: "",
  });

  const [currentStep, setCurrentStep] = useState(1);

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS)); // functional update avoids stale closure
  }, []);

  const previousStep = useCallback(() => {
    setCurrentStep((s) => Math.max(1, s - 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.min(Math.max(1, step), TOTAL_STEPS));
  }, []);

  const skipOnboarding = useCallback(() => {
    // If you persist “skipped”, do it here (or just jump to end)
    setCurrentStep(TOTAL_STEPS);
  }, []);

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const value = useMemo<OnboardingContextType>(
    () => ({
      data,
      currentStep,
      totalSteps: TOTAL_STEPS,
      progress,
      updateData,
      nextStep,
      previousStep,
      goToStep,
      skipOnboarding,
      isFirstStep: currentStep === 1,
      isLastStep: currentStep === TOTAL_STEPS,
    }),
    [
      data,
      currentStep,
      progress,
      updateData,
      nextStep,
      previousStep,
      goToStep,
      skipOnboarding,
    ]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx)
    throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
