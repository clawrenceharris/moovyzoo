"use client";

import { useState } from "react";
import { cn } from "@/styles/styles";
import { GenreSelection } from "./";
import { OnboardingData, OnboardingStep } from "../../domain/auth.types";
import Image from "next/image";

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
  className?: string;
}

interface StepIndicatorProps {
  currentStep: OnboardingStep;
  totalSteps: number;
}

interface NavigationProps {
  currentStep: OnboardingStep;
  canProceed: boolean;
  canSkip: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  isLoading?: boolean;
}

function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    OnboardingStep.WELCOME,
    OnboardingStep.DISPLAY_NAME,
    OnboardingStep.GENRE_SELECTION,
    OnboardingStep.AVATAR,
  ];

  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="mb-8 flex items-center justify-center space-x-2">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
              index <= currentIndex
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-500"
            )}
          >
            {index + 1}
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "mx-2 h-0.5 w-12",
                index < currentIndex ? "bg-primary" : "bg-gray-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Navigation({
  currentStep,
  canProceed,
  canSkip,
  onNext,
  onPrevious,
  onSkip,
  isLoading,
}: NavigationProps) {
  const isFirstStep = currentStep === OnboardingStep.WELCOME;
  const isLastStep = currentStep === OnboardingStep.AVATAR;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 pt-6">
      <div>
        {!isFirstStep && (
          <button
            type="button"
            onClick={onPrevious}
            disabled={isLoading}
            className={cn(
              "rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700",
              "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            Previous
          </button>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {canSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={isLoading}
            className={cn(
              "px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            Skip for now
          </button>
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className={cn(
            "rounded-xl bg-primary px-6 py-2 text-sm font-medium text-white",
            "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "flex items-center space-x-2"
          )}
        >
          {isLoading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          <span>{isLastStep ? "Complete" : "Next"}</span>
        </button>
      </div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <div className="py-12 text-center">
      <div className="mb-6">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="h-8 w-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"
            />
          </svg>
        </div>
        <h2 className="mb-4 text-3xl font-bold text-gray-900">
          Welcome to MoovyZoo!
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Let&apos;s set up your profile so we can personalize your movie and TV
          show experience. This will only take a few minutes.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mb-2 font-semibold text-gray-900">
            Choose Your Genres
          </h3>
          <p className="text-sm text-gray-600">
            Select your favorite movie genres to get personalized
            recommendations
          </p>
        </div>

        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="mb-2 font-semibold text-gray-900">
            Create Your Profile
          </h3>
          <p className="text-sm text-gray-600">
            Add your display name and avatar to connect with other movie lovers
          </p>
        </div>

        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
            <svg
              className="h-6 w-6 text-purple-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <h3 className="mb-2 font-semibold text-gray-900">Start Exploring</h3>
          <p className="text-sm text-gray-600">
            Discover movies, join discussions, and connect with fellow film
            enthusiasts
          </p>
        </div>
      </div>
    </div>
  );
}

function DisplayNameStep({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="mx-auto max-w-md py-12">
      <div className="mb-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          What should we call you?
        </h2>
        <p className="text-gray-600">
          Choose a display name that other users will see when you interact on
          the platform.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="displayName"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your display name"
            className={cn(
              "w-full rounded-xl border px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary",
              error ? "border-red-500" : "border-gray-300"
            )}
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex">
            <svg
              className="mr-3 mt-0.5 h-5 w-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="mb-1 text-sm font-medium text-blue-900">
                Tips for choosing a display name:
              </h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Use 2-50 characters</li>
                <li>
                  • Letters, numbers, spaces, hyphens, and underscores are
                  allowed
                </li>
                <li>
                  • Make it memorable and appropriate for a community setting
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AvatarStep({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="mx-auto max-w-md py-12">
      <div className="mb-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          Add Your Avatar
        </h2>
        <p className="text-gray-600">
          Add a profile picture to help other users recognize you. You can
          always change this later.
        </p>
      </div>

      <div className="space-y-6">
        {/* Avatar preview */}
        <div className="flex justify-center">
          <div className="relative">
            {value ? (
              <Image
                src={value}
                alt="Avatar preview"
                className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}
            <div
              className={cn(
                "flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gray-200 shadow-lg",
                value ? "hidden" : ""
              )}
            >
              <svg
                className="h-8 w-8 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="avatarUrl"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Avatar URL (Optional)
          </label>
          <input
            type="url"
            id="avatarUrl"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/your-avatar.jpg"
            className={cn(
              "w-full rounded-xl border px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary",
              error ? "border-red-500" : "border-gray-300"
            )}
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="rounded-lg bg-yellow-50 p-4">
          <div className="flex">
            <svg
              className="mr-3 mt-0.5 h-5 w-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="mb-1 text-sm font-medium text-yellow-900">
                Avatar Guidelines:
              </h4>
              <ul className="space-y-1 text-sm text-yellow-800">
                <li>• Use a publicly accessible image URL</li>
                <li>• Recommended size: 200x200 pixels or larger</li>
                <li>• Keep it appropriate for all audiences</li>
                <li>• You can skip this step and add an avatar later</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingFlow({
  onComplete,
  onSkip,
  className,
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(
    OnboardingStep.WELCOME
  );
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Partial<OnboardingData>>({
    favoriteGenres: [],
    displayName: "",
    avatarUrl: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    OnboardingStep.WELCOME,
    OnboardingStep.DISPLAY_NAME,
    OnboardingStep.GENRE_SELECTION,
    OnboardingStep.AVATAR,
  ];

  const currentStepIndex = steps.indexOf(currentStep);
  const totalSteps = steps.length;

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case OnboardingStep.DISPLAY_NAME:
        if (!data.displayName || data.displayName.trim().length < 2) {
          newErrors.displayName = "Display name must be at least 2 characters";
        } else if (data.displayName.length > 50) {
          newErrors.displayName =
            "Display name must be less than 50 characters";
        } else if (!/^[a-zA-Z0-9\s_-]+$/.test(data.displayName)) {
          newErrors.displayName =
            "Display name can only contain letters, numbers, spaces, hyphens, and underscores";
        }
        break;

      case OnboardingStep.GENRE_SELECTION:
        if (!data.favoriteGenres || data.favoriteGenres.length === 0) {
          newErrors.genres = "Please select at least one favorite genre";
        } else if (data.favoriteGenres.length > 10) {
          newErrors.genres = "You can select up to 10 favorite genres";
        }
        break;

      case OnboardingStep.AVATAR:
        if (data.avatarUrl && data.avatarUrl.trim()) {
          try {
            new URL(data.avatarUrl);
          } catch {
            newErrors.avatarUrl = "Please enter a valid URL";
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case OnboardingStep.WELCOME:
        return true;
      case OnboardingStep.DISPLAY_NAME:
        return !!data.displayName && data.displayName.trim().length >= 2;
      case OnboardingStep.GENRE_SELECTION:
        return !!data.favoriteGenres && data.favoriteGenres.length > 0;
      case OnboardingStep.AVATAR:
        return true; // Avatar is optional
      default:
        return false;
    }
  };

  const canSkip = (): boolean => {
    return currentStep !== OnboardingStep.WELCOME;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep === OnboardingStep.AVATAR) {
      // Complete onboarding
      setIsLoading(true);
      try {
        await onComplete(data as OnboardingData);
      } catch (error) {
        console.error("Error completing onboarding:", error);
        // Handle error - could show a toast or error message
      } finally {
        setIsLoading(false);
      }
    } else {
      // Move to next step
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex]);
      }
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
      setErrors({}); // Clear errors when going back
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
    // Clear related errors
    const newErrors = { ...errors };
    Object.keys(updates).forEach((key) => {
      delete newErrors[key];
    });
    setErrors(newErrors);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case OnboardingStep.WELCOME:
        return <WelcomeStep />;

      case OnboardingStep.DISPLAY_NAME:
        return (
          <DisplayNameStep
            value={data.displayName || ""}
            onChange={(value) => updateData({ displayName: value })}
            error={errors.displayName}
          />
        );

      case OnboardingStep.GENRE_SELECTION:
        return (
          <div className="py-8">
            <GenreSelection
              selectedGenres={data.favoriteGenres || []}
              onSelectionChange={(genres) =>
                updateData({ favoriteGenres: genres })
              }
            />
            {errors.genres && (
              <div className="mt-4 text-center">
                <p className="text-sm text-red-600">{errors.genres}</p>
              </div>
            )}
          </div>
        );

      case OnboardingStep.AVATAR:
        return (
          <AvatarStep
            value={data.avatarUrl || ""}
            onChange={(value) => updateData({ avatarUrl: value })}
            error={errors.avatarUrl}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("mx-auto max-w-4xl px-4 py-8", className)}>
      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-8">{renderCurrentStep()}</div>

        <Navigation
          currentStep={currentStep}
          canProceed={canProceed()}
          canSkip={canSkip()}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSkip={handleSkip}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
