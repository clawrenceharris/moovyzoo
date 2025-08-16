import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { SignupData } from "../domain/auth.types";
import { fieldValidators } from "../utils";
import { cn } from "@/utils/cn";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui";

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  className?: string;
  authError?: string | null; // server-side auth error
  loading?: boolean;
}

export function SignUpForm({
  onSwitchToLogin,
  className,
  authError,
}: SignupFormProps) {
  const {
    register,
    control,
    formState: { errors, disabled },
  } = useFormContext<SignupData>();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cn("w-full max-w-md", className)}>
      {/* Display Name */}

      <FormField
        control={control}
        name="displayName"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="signup-displayName">Display Name</FormLabel>
            <Input
              id="signup-displayName"
              type="text"
              autoComplete="nickname"
              disabled={field.disabled}
              placeholder="Enter your display name"
              {...register("displayName", {
                required: "Display name is required",
                minLength: { value: 2, message: "Too short" },
              })}
            />
            {errors.displayName && <p>{errors.displayName.message}</p>}
          </FormItem>
        )}
      />
      {/* Email */}
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="signup-email">Email Address</FormLabel>
            <Input
              id="signup-email"
              type="email"
              disabled={field.disabled}
              placeholder="Enter your email"
              {...register("email", {
                validate: (email) => fieldValidators.validateEmailField(email),
              })}
            />
            {errors.email && <p>{errors.email.message}</p>}
          </FormItem>
        )}
      />

      {/* Password */}
      <div>
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="signup-password">Password</FormLabel>
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                disabled={field.disabled}
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
                disabled={field.disabled}
              >
                <span className="sr-only">Toggle password visibility</span>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              {errors.password && <p>{errors.password.message}</p>}
            </FormItem>
          )}
        />
      </div>

      {/* Auth error from server */}
      {authError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{authError}</p>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        Press “Sign Up” to create your account.
      </p>

      {/* Switch to login */}
      {onSwitchToLogin && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-medium text-primary hover:text-red-700"
              disabled={disabled}
            >
              Sign in
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
