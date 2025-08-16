import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { cn, styles } from "@/styles/styles";
import { SignupData } from "../../domain/auth.types";
import { fieldValidators } from "../../utils";

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
  loading,
}: SignupFormProps) {
  const {
    register,
    formState: { errors, isSubmitting },
  } = useFormContext<SignupData>();
  const [showPassword, setShowPassword] = useState(false);
  const disabled = loading || isSubmitting;

  return (
    <div className={cn("w-full max-w-md", className)}>
      {/* Display Name */}
      <div>
        <label htmlFor="signup-displayName" className={styles.form.label}>
          Display Name
        </label>
        <input
          id="signup-displayName"
          type="text"
          autoComplete="nickname"
          disabled={disabled}
          placeholder="Enter your display name"
          className={cn(
            styles.form.input,
            errors.displayName && styles.form.inputError
          )}
          {...register("displayName", {
            required: "Display name is required",
            minLength: { value: 2, message: "Too short" },
          })}
        />
        {errors.displayName && (
          <p className={styles.text.error}>{errors.displayName.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="signup-email" className={styles.form.label}>
          Email Address
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          disabled={disabled}
          placeholder="Enter your email"
          className={cn(
            styles.form.input,
            errors.email && styles.form.inputError
          )}
          {...register("email", {
            validate: (email) => fieldValidators.validateEmailField(email),
          })}
        />
        {errors.email && (
          <p className={styles.text.error}>{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="signup-password" className={styles.form.label}>
          Password
        </label>
        <div className="relative">
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            disabled={disabled}
            placeholder="Create a password"
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
            <span className="sr-only">Toggle password visibility</span>
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
            </svg>
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
