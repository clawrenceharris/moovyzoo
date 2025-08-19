"use client";

import { OnboardingWizard } from "@/features/onboarding/components";

export default function SignUpPage({ nextPath = "/" }: { nextPath?: string }) {
  return (
    <div className="bg-secondary-background">
      <div className="text-center my-8">
        <h1 className="text-2xl font-semibold">Sign Up</h1>
      </div>

      <OnboardingWizard nextPath={nextPath} />
    </div>
  );
}
