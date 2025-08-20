"use client";

import { useRouter } from "next/navigation";
import { SignupData } from "../../auth/domain/auth.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import GenreSelectionStep from "./GenreSelectionStep";
import ProfileSetupStep from "./ProfileSetupStep";
import AvatarUploadStep from "./AvatarUploadStep";
import FormLayout from "@/components/FormLayout";
import { signupSchema } from "../../auth/domain/auth.schema";
import { useAuth } from "../../auth/hooks";
import { OnboardingProvider, useOnboarding } from "../OnboardingContext";
import { SignUpForm } from "@/features/auth/components";
import { useProfileActions } from "@/features/profile/hooks/useProfileActions";
import { User } from "@supabase/supabase-js";

function OnboardingBody({ user }: { user: User }) {
  const router = useRouter();
  const { createProfile, isCreating, createError } = useProfileActions(user.id);
  const {
    currentStep,

    nextStep,
    previousStep,
    isFirstStep,
    isLastStep,
    totalSteps,
    data,
  } = useOnboarding();

  const handleNext = async () => {
    if (isLastStep) {
      completeOnboarding();
    } else {
      nextStep();
    }
  };
  const skipOnboarding = () => {
    completeOnboarding();
  };
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <GenreSelectionStep />;
      case 2:
        return <ProfileSetupStep />;
      case 3:
        return <AvatarUploadStep />;
    }
  };
  const completeOnboarding = () => {
    createProfile({
      onboardingCompleted: true,
      displayName: data.displayName,
      quote: data.quote,
      favoriteGenres: data.favoriteGenres,
      userId: user.id,
      email: user.email || "",
      username: data.username,
    });
    router.replace("/");
  };
  return (
    <div className="onboarding-wizard">
      <Card className="onboarding-card">
        <CardHeader className="space-y-4">
          {/* Progress indicator */}

          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </p>
              <Button
                variant="default"
                className="text-foreground"
                disabled={!user}
                onClick={skipOnboarding}
              >
                Skip All
              </Button>
            </div>
            <div className="flex space-x-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="progress-bar">
                  <div
                    className={`progress-fill ${
                      index <= currentStep - 1
                        ? "bg-primary"
                        : "bg-background/5"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error display */}
          {createError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm text-destructive font-medium">
                  {createError.message}
                </p>
              </div>
            </div>
          )}

          {/* Step content with animation */}
          <div className="min-h-[300px] transition-all duration-300 ease-in-out">
            {renderStep()}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between gap-3">
            {!isFirstStep && (
              <Button
                variant="outline"
                onClick={previousStep}
                disabled={isCreating}
              >
                Back
              </Button>
            )}

            <Button
              variant="primary"
              onClick={handleNext}
              disabled={isCreating}
              className={`min-w-[100px] transition-all duration-200 hover:scale-105 ${
                isLastStep ? "animate-glow-pulse" : ""
              }`}
            >
              {isLastStep ? "Complete" : "Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OnboardingWizard(props: { nextPath?: string }) {
  const { user, error, loading, signup } = useAuth();
  const router = useRouter();
  if (!user) {
    return (
      <div className="onboarding-wizard">
        <Card className="onboarding-card">
          <CardHeader className="space-y-4">
            <h1> Sign Up </h1>
            <CardContent className="space-y-6">
              <FormLayout<SignupData>
                isLoading={loading}
                error={error}
                mode="onChange"
                submitText="Get Started!"
                description="Sign up to start watching your favorite movies with your favorite people!"
                formSchema={signupSchema}
                onSubmit={signup}
              >
                <SignUpForm
                  onSwitchToLogin={() => {
                    const url = props?.nextPath
                      ? `/auth/login?next=${encodeURIComponent(props.nextPath)}`
                      : "/auth/login";
                    router.push(url);
                  }}
                />
              </FormLayout>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    );
  }
  return (
    <OnboardingProvider>
      <OnboardingBody user={user} />
    </OnboardingProvider>
  );
}
