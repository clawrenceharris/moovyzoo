"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import FormLayout from "@/components/FormLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { habitatsService } from "../domain/habitats.service";
import {
  createHabitatFormSchema,
  type CreateHabitatFormInput,
} from "../domain/habitats.schema";
import {
  getFriendlyErrorMessage,
  normalizeError,
} from "@/utils/normalize-error";
import { errorMap } from "@/utils/error-map";
import { zodResolver } from "@hookform/resolvers/zod";

interface HabitatCreationFormProps {
  userId: string;
  onSuccess?: (habitatId: string) => void;
  onCancel?: () => void;
}

export function HabitatCreationForm({
  userId,
  onSuccess,
  onCancel,
}: HabitatCreationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const handleSubmit = async (data: CreateHabitatFormInput) => {
    setIsLoading(true);
    setError(null);

    // Validate tags before submission
    if (tags.length === 0) {
      setError("At least one tag is required");
      setIsLoading(false);
      return;
    }

    try {
      const habitat = await habitatsService.createHabitat(
        data.name,
        data.description,
        tags,
        data.isPublic,
        userId
      );

      if (onSuccess) {
        onSuccess(habitat.id);
      } else {
        // Navigate to the new habitat
        router.push(`/habitats/${habitat.id}`);
      }
    } catch (err) {
      const errorMessage = getFriendlyErrorMessage(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (
      trimmedTag &&
      !tags.includes(trimmedTag) &&
      tags.length < 5 &&
      trimmedTag.length <= 30
    ) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <FormLayout<CreateHabitatFormInput>
      resolver={zodResolver(createHabitatFormSchema)}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
      error={error}
      submitText="Create Habitat"
      showsCancelButton={!!onCancel}
      defaultValues={{
        name: "",
        description: "",
        isPublic: true,
        userId,
      }}
      description="Create a new habitat for movie and TV discussions"
    >
      {(form) => (
        <>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Habitat Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter habitat name (e.g., Marvel Movies)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe what this habitat is about..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Tags</FormLabel>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag (e.g., action, comedy)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                disabled={tags.length >= 5}
              />
              <Button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim() || tags.length >= 5}
                variant="secondary"
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-accent/20 text-accent rounded-md text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-accent-foreground"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {tags.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Add at least one tag to help others discover your habitat
              </p>
            )}
            {tags.length >= 5 && (
              <p className="text-sm text-muted-foreground">
                Maximum 5 tags allowed
              </p>
            )}
          </div>

          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <FormLabel htmlFor="isPublic" className="text-sm font-normal">
                    Make this habitat public (others can discover and join)
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </FormLayout>
  );
}
