"use client";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/hooks/useAuth";
import FormLayout from "@/components/FormLayout";
import { LoginData } from "@/features/auth/domain/auth.types";
import { LoginForm } from "@/features/auth/components";

export default function LoginPage({ nextPath = "/" }: { nextPath?: string }) {
  const router = useRouter();
  const { login, loading, error, resetPassword } = useAuth(); // implement with supabase.auth

  return (
    <div>
      <header>
        <h1>Sign in to MoovyZoo</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back, cinephile.</p>
      </header>

      <FormLayout<LoginData>
        defaultValues={{ email: "", password: "" }}
        submitText="Sign In"
        isLoading={loading}
        error={error}
        onSubmit={login}
      >
        <LoginForm
          onForgotPassword={resetPassword}
          onSwitchToSignup={() => {
            const url = nextPath
              ? `/signup?next=${encodeURIComponent(nextPath)}`
              : "/signup";
            router.push(url);
          }}
        />
      </FormLayout>
    </div>
  );
}
