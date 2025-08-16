"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { LoginData } from "../domain/auth.types";
import { fieldValidators } from "../utils";
import { Label } from "@/components/ui/label";
import { Button, Input } from "@/components/ui";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  onForgotPassword?: (email: string) => void;
  className?: string;
}

export function LoginForm({
  onSwitchToSignup,
  onForgotPassword,
}: LoginFormProps) {
  const {
    register,
    getValues,
    control,
    formState: { errors, disabled },
  } = useFormContext<LoginData>();
  const [showPassword, setShowPassword] = useState(false);
  const handleForgotPassword = () => {
    onForgotPassword?.(getValues("email"));
  };
  return (
    <div>
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
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          {onForgotPassword && (
            <Button
              type="button"
              onClick={handleForgotPassword}
              disabled={disabled}
            >
              Forgot password?
            </Button>
          )}
        </div>
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="signup-email">Email Address</FormLabel>

              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={field.disabled}
                  placeholder="Enter your password"
                  {...register("password", {
                    validate: (password) =>
                      fieldValidators.validatePasswordField(password),
                  })}
                />
                <Button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  disabled={disabled}
                >
                  {/* your icon logic here */}
                  <span className="sr-only">Toggle password visibility</span>
                </Button>
              </div>

              {errors.password && <p>{errors.password.message}</p>}
            </FormItem>
          )}
        />
      </div>

      {/* Switch to signup */}
      {onSwitchToSignup && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Button
              type="button"
              onClick={onSwitchToSignup}
              className="font-medium text-primary hover:text-red-700"
              disabled={disabled}
            >
              Create account
            </Button>
          </p>
        </div>
      )}
    </div>
  );
}
