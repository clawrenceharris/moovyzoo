import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { SignupData } from "../domain/auth.types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button, Input } from "@/components/ui";
import { Eye, EyeOff } from "lucide-react";

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  className?: string;
}

export default function SignUpForm({ onSwitchToLogin }: SignupFormProps) {
  const {
    register,
    control,
    formState: { errors, disabled },
  } = useFormContext<SignupData>();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      {/* Email */}
      <FormField
        control={control}
        name="email"
        defaultValue=""
        rules={{ required: "Email is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="sr-only" htmlFor="signup-email">
              Email Address
            </FormLabel>
            <FormControl>
              <Input
                id="signup-email"
                type="text"
                placeholder="Email"
                {...field}
              />
            </FormControl>
            {errors.email && <FormMessage>{errors.email.message}</FormMessage>}
          </FormItem>
        )}
      />

      {/* Password */}
      <div>
        <FormItem>
          <FormLabel className="sr-only" htmlFor="signup-password">
            Password
          </FormLabel>
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Password"
            {...register("password", {
              required: "Password is required",
            })}
          />
          <Button
            type="button"
            variant={"default"}
            size={"icon"}
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((s) => !s)}
            className="absolute-center  flex  text-gray-400 hover:text-gray-600 left-[95%]"
            disabled={disabled}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
          {errors.password && (
            <FormMessage>{errors.password.message}</FormMessage>
          )}
        </FormItem>
      </div>

      {/* Switch to login */}
      {onSwitchToLogin && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="btn font-medium text-primary hover:text-red-700"
              disabled={disabled}
            >
              Sign in
            </button>
          </p>
        </div>
      )}
    </>
  );
}
