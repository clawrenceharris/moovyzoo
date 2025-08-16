"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { cn, styles } from "@/styles/styles";
import { LoginData } from "../../domain/auth.types";
import { fieldValidators } from "../../utils";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  onForgotPassword?: (email: string) => void;
  className?: string;
  authError?: string | null; // optional: pass down auth error to show here
  loading?: boolean; // optional: pass down loading state
}

export function LoginForm({
  onSwitchToSignup,
  onForgotPassword,
  className,
  authError,
  loading,
}: LoginFormProps) {
  const {
    register,
    getValues,
    formState: { errors, isSubmitting },
  } = useFormContext<LoginData>();
  const [showPassword, setShowPassword] = useState(false);
  const disabled = loading || isSubmitting;

  const handleForgotPassword = () => {
    onForgotPassword?.(getValues("email"));
  };
  return (
    <div className={cn("w-full max-w-md", className)}>
      {/* Email */}
      <div>
        <label htmlFor="login-email" className={styles.form.label}>
          Email Address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          disabled={disabled}
          placeholder="Enter your email"
          className={cn(
            styles.form.input,
            errors.email && styles.form.inputError
          )}
          {...register("email", {
            required: "Email is required.",
            validate: (email) => fieldValidators.validateEmailField(email),
          })}
        />
        {errors.email && (
          <p className={styles.text.error}>{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className={styles.form.label}>
            Password
          </label>
          {onForgotPassword && (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-primary hover:text-red-700"
              disabled={disabled}
            >
              Forgot password?
            </button>
          )}
        </div>

        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            disabled={disabled}
            placeholder="Enter your password"
            className={cn(
              styles.form.input,
              "pr-10",
              errors.password && styles.form.inputError
            )}
            {...register("password", {
              validate: (password) =>
                fieldValidators.validatePasswordField(password),
            })}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            disabled={disabled}
          >
            {/* your icon logic here */}
            <span className="sr-only">Toggle password visibility</span>
          </button>
        </div>

        {errors.password && (
          <p className={styles.text.error}>{errors.password.message}</p>
        )}
      </div>

      {/* Auth error from server */}
      {authError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{authError}</p>
        </div>
      )}

      {/* No submit button here. FormLayout owns submit. */}
      {/* But you can show a helper: */}
      <p className="text-xs text-gray-500 mt-2">Press “Sign In” to continue.</p>

      {/* Switch to signup */}
      {onSwitchToSignup && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="font-medium text-primary hover:text-red-700"
              disabled={disabled}
            >
              Create account
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
