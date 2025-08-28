"use client";

import { Input } from "@/components/ui/Input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FormLayout from "@/components/FormLayout";
import { onboardingProfileDataSchema } from "@/features/auth/domain/auth.schema";
import { useOnboarding } from "../OnboardingContext";
import { zodResolver } from "@hookform/resolvers/zod";

export default function ProfileSetupStep() {
  const { data, updateData } = useOnboarding();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Tell us about yourself</h2>
        <p className="text-muted-foreground">
          Set up your profile so other movie lovers can find you
        </p>
      </div>

      <div className="space-y-6">
        <FormLayout<{ displayName: string; quote?: string }>
          resolver={zodResolver(onboardingProfileDataSchema)}
          defaultValues={{ displayName: data.displayName, quote: data.quote }}
          showsSubmitButton={false}
        >
          {({ control, formState: { errors } }) => {
            return (
              <>
                {/* Display Name */}
                <FormField
                  control={control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only" htmlFor="displayName">
                        Display Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="displayName"
                          type="text"
                          placeholder="Display Name"
                          onChange={(e) =>
                            updateData({ displayName: e.target.value })
                          }
                        />
                      </FormControl>

                      {errors.displayName ? (
                        <FormMessage>{errors.displayName.message}</FormMessage>
                      ) : (
                        <FormMessage className="text-xs text-muted-foreground">
                          This is how others will see you
                        </FormMessage>
                      )}
                    </FormItem>
                  )}
                ></FormField>

                {/* Favorite Movie Quote */}
                <FormField
                  name="quote"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only" htmlFor="quote">
                        Favorite Movie Quote
                        <span className="font-light text-muted-foreground">
                          (optional)
                        </span>
                      </FormLabel>
                      <Input
                        {...field}
                        id="quote"
                        type="text"
                        placeholder="Movie/TV Quote"
                        onChange={(e) => updateData({ quote: e.target.value })}
                      />
                      <FormMessage className="text-xs text-muted-foreground">
                        {
                          "Share a quote to add some character to your profile (e.g., 'May the Force be with you')"
                        }
                      </FormMessage>
                    </FormItem>
                  )}
                ></FormField>
              </>
            );
          }}
        </FormLayout>
      </div>
    </div>
  );
}
