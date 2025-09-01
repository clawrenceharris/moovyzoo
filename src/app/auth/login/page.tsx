"use client";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/hooks/use-auth";
import FormLayout from "@/components/FormLayout";
import { LoginData } from "@/features/auth/domain/auth.types";
import { LoginForm } from "@/features/auth/components";
import { loginSchema } from "@/features/auth/domain/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error, resetPassword } = useAuth(); // implement with supabase.auth

  // Get nextPath from URL params
  const nextPath = "/";

  return (
    <div className="bg-secondary-background">
      <div className="text-center my-8">
        <h1 className="text-2xl font-semibold">Sign Up</h1>
      </div>
      <FormLayout<LoginData>
        defaultValues={{ email: "", password: "" }}
        submitText="Sign In"
        isLoading={loading}
        resolver={zodResolver(loginSchema)}
        error={error}
        onSubmit={login}
      >
        <LoginForm
          onForgotPassword={resetPassword}
          onSwitchToSignup={() => {
            const url = nextPath
              ? `/auth/signup?next=${encodeURIComponent(nextPath)}`
              : "/auth/signup";
            router.push(url);
          }}
        />
      </FormLayout>
    </div>
  );
}
