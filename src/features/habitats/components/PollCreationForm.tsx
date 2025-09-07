"use client";

import React, { useState } from "react";
import { Button, FormLabel, Input } from "@/components/ui";
import { Plus, X } from "lucide-react";
import { habitatsService } from "../domain/habitats.service";
import { normalizeError } from "@/utils/normalize-error";
import type { Poll } from "../domain/habitats.types";

interface PollCreationFormProps {
  habitatId: string;
  userId: string;
  onSuccess: (poll: Poll) => void;
  onCancel: () => void;
  className?: string;
}

interface FormData {
  title: string;
  options: string[];
}

interface FormErrors {
  title?: string;
  options?: string;
  general?: string;
}

export function PollCreationForm({
  habitatId,
  userId,
  onSuccess,
  onCancel,
  className = "",
}: PollCreationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    options: ["", ""],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form data
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Validate title (5-200 characters)
    if (!formData.title.trim()) {
      newErrors.title = "Poll title is required";
    } else if (formData.title.trim().length < 5) {
      newErrors.title = "Poll title must be at least 5 characters";
    } else if (formData.title.trim().length > 200) {
      newErrors.title = "Poll title must be no more than 200 characters";
    }

    // Validate options (2-6 options, 1-100 chars each)
    const validOptions = formData.options.filter(
      (opt) => opt.trim().length > 0
    );
    if (validOptions.length < 2) {
      newErrors.options = "Poll must have at least 2 options";
    } else if (validOptions.length > 6) {
      newErrors.options = "Poll can have at most 6 options";
    } else {
      // Check individual option lengths
      const invalidOption = validOptions.find((opt) => opt.trim().length > 100);
      if (invalidOption) {
        newErrors.options = "Each option must be no more than 100 characters";
      }
    }

    return newErrors;
  };

  // Handle title change
  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, title: value }));

    // Clear title error when user starts typing
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: undefined }));
    }
  };

  // Handle option change
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));

    // Clear options error when user starts typing
    if (errors.options) {
      setErrors((prev) => ({ ...prev, options: undefined }));
    }
  };

  // Add new option
  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, ""],
      }));
    }
  };

  // Remove option
  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, options: newOptions }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const validOptions = formData.options.filter(
        (opt) => opt.trim().length > 0
      );

      // Convert options array to Record<string, number> with 0 initial votes
      const optionsRecord: Record<string, number> = {};
      validOptions.forEach((opt) => {
        optionsRecord[opt.trim()] = 0;
      });

      const poll = await habitatsService.createPoll(
        habitatId,
        formData.title.trim(),
        optionsRecord,
        userId
      );

      onSuccess(poll);
    } catch (error) {
      const normalizedError = normalizeError(error);
      setErrors({ general: normalizedError.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 ${className}`}
      id="poll-creation-form"
    >
      {/* General Error */}
      {errors.general && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {errors.general}
        </div>
      )}

      {/* Poll Title */}
      <div className="space-y-2">
        <FormLabel>Poll Title *</FormLabel>
        <Input
          id="poll-title"
          type="text"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Enter poll title"
          className={errors.title ? "border-red-500" : ""}
          disabled={isSubmitting}
          maxLength={200}
        />
        {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
        <p className="text-xs text-muted-foreground">
          {formData.title.length}/200 characters
        </p>
      </div>

      {/* Poll Options */}
      <div className="space-y-2">
        <FormLabel>Poll Options *</FormLabel>
        <div className="space-y-2">
          {formData.options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1"
                disabled={isSubmitting}
                maxLength={100}
              />
              {formData.options.length > 2 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeOption(index)}
                  disabled={isSubmitting}
                  className="px-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Add Option Button */}
        {formData.options.length < 6 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            disabled={isSubmitting}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Option
          </Button>
        )}

        {errors.options && (
          <p className="text-sm text-red-600">{errors.options}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {formData.options.filter((opt) => opt.trim().length > 0).length}/6
          options
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Poll"}
        </Button>
      </div>
    </form>
  );
}
