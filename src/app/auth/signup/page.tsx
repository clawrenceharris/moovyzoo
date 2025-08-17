"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/hooks/useAuth";
import FormLayout from "@/components/FormLayout";
import { SignupData } from "@/features/auth/domain/auth.types";
import { SignupForm } from "@/features/auth/components";

export default function SignUpPage({ nextPath = "/" }: { nextPath?: string }) {
  const router = useRouter();
  const { signup, error, clearError } = useAuth(); // implement with supabase.auth
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <header className="text-center">
        <h1 className="text-2xl font-semibold">Sign in to Zoovie</h1>
        <p>Sign up to join Bingers worldwide</p>
      </header>

      <FormLayout<SignupData>
        defaultValues={{ email: "", password: "" }}
        submitText="Sign Up"
        isLoading={loading}
        error={error}
        onSubmit={async (data) => {
          clearError();
          setLoading(true);
          try {
            await signup(data);
            // router.replace(nextPath || "/");
          } catch {
          } finally {
            setLoading(false);
          }
        }}
      >
        <SignupForm
          loading={loading}
          authError={error}
          onSwitchToLogin={() => {
            const url = nextPath
              ? `/auth/login?next=${encodeURIComponent(nextPath)}`
              : "/auth/login";
            router.push(url);
          }}
        />
      </FormLayout>
    </div>
  );
}
