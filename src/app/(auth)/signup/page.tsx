"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn } from "@/styles/styles";
import FormLayout from "@/components/FormLayout";
import { SignupData } from "@/features/auth/domain/auth.types";
import { SignupForm } from "@/features/auth/components/auth";

export default function SignUpPage({ nextPath = "/" }: { nextPath?: string }) {
  const router = useRouter();
  const { signup, error, clearError } = useAuth(); // implement with supabase.auth
  const [loading, setLoading] = useState(false);

  return (
    <div className={cn("mx-auto flex w-full max-w-xl flex-col gap-6 p-6")}>
      <header className="text-center">
        <h1 className="text-2xl font-semibold">Sign in to MoovyZoo</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back, cinephile.</p>
      </header>

      <FormLayout<SignupData>
        defaultValues={{ email: "", password: "" }}
        submitText="Sign In"
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
              ? `/login?next=${encodeURIComponent(nextPath)}`
              : "/login";
            router.push(url);
          }}
        />
      </FormLayout>
    </div>
  );
}
