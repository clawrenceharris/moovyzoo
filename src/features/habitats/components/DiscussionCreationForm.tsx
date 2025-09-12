"use client";
import { useFormContext } from "react-hook-form";
import { CreateDiscussionInput } from "../domain";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from "@/components/ui";

export function DiscussionCreationForm() {
  const {
    control,
    formState: { errors, isSubmitting },
  } = useFormContext<CreateDiscussionInput>();

  return (
    <>
      {/* Discussion Name */}
      <FormField
        control={control}
        name="name"
        defaultValue=""
        render={({ field }) => (
          <FormItem>
            <FormLabel className="sr-only">Discussion Title</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Discussion Title"
                className={errors.name ? "border-red-500" : ""}
                disabled={isSubmitting}
                {...field}
              />
            </FormControl>
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="description"
        defaultValue=""
        render={({ field }) => (
          <FormItem>
            <FormLabel className="sr-only">Description (Optional)</FormLabel>
            <FormControl>
              <Input
                height={300}
                placeholder="Description"
                disabled={isSubmitting}
                maxLength={500}
                {...field}
              />
            </FormControl>

            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </FormItem>
        )}
      />
    </>
  );
}
