import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { SignupData } from "../domain/auth.types";
import { fieldValidators } from "../utils";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Button, Input } from "@/components/ui";
import { Eye, EyeOff } from "lucide-react";

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  className?: string;
  authError?: string | null; // server-side auth error
  loading?: boolean;
}

export function SignUpForm({ onSwitchToLogin, authError }: SignupFormProps) {
  const {
    register,
    control,
    formState: { errors, disabled },
  } = useFormContext<SignupData>();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {/* Display Name */}

      <FormField
        control={control}
        name="displayName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="sr-only" htmlFor="signup-displayName">
              Display Name
            </FormLabel>
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
            <FormLabel className="sr-only" htmlFor="signup-email">
              Email Address
            </FormLabel>
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
              <FormLabel className="sr-only" htmlFor="signup-password">
                Password
              </FormLabel>
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
              <Button
                type="button"
                variant={"default"}
                size={"icon"}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute-center  flex  text-gray-400 hover:text-gray-600 left-[95%]"
                disabled={field.disabled}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
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
