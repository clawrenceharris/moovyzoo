"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { LoginData } from "../domain/auth.types";
import { Button, Input } from "@/components/ui";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui";
import { Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  onForgotPassword?: (email: string) => void;
  className?: string;
}

export default function LoginForm({
  onSwitchToSignup,
  onForgotPassword,
}: LoginFormProps) {
  const {
    getValues,
    control,
    formState: { errors, disabled },
  } = useFormContext<LoginData>();
  const [showPassword, setShowPassword] = useState(false);
  const handleForgotPassword = () => {
    onForgotPassword?.(getValues("email"));
  };
  return (
    <>
      {/* Email */}
      <FormField
        control={control}
        name="email"
        defaultValue=""
        render={({ field }) => (
          <FormItem>
            <FormLabel className="sr-only" htmlFor="signup-email">
              Email Address
            </FormLabel>
            <FormControl>
              <Input
                id="signup-email"
                type="email"
                disabled={field.disabled}
                placeholder="Enter your email"
                {...field}
              />
            </FormControl>
            {errors.email && <p>{errors.email.message}</p>}
          </FormItem>
        )}
      />

      {/* Password */}
      <div>
        <FormField
          control={control}
          name="password"
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="signup-email">Password</FormLabel>

              <div className="relative">
                <FormControl>
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    disabled={field.disabled}
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-2 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  disabled={disabled}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">Toggle password visibility</span>
                </Button>
              </div>
              {errors.password && <p>{errors.password.message}</p>}
            </FormItem>
          )}
        />
        <div className="flex my-4 justify-end">
          {onForgotPassword && (
            <Button
              variant={"secondary"}
              type="button"
              onClick={handleForgotPassword}
              disabled={disabled}
            >
              Forgot password?
            </Button>
          )}
        </div>
      </div>

      {/* Switch to signup */}
      {onSwitchToSignup && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <button
              className="text-primary cursor-pointer"
              type="button"
              onClick={onSwitchToSignup}
            >
              Sign up
            </button>
          </p>
        </div>
      )}
    </>
  );
}
