"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { habitatsService } from "../domain/habitats.service";
import { normalizeError } from "@/utils/normalize-error";
import type { Discussion } from "../domain/habitats.types";

interface DiscussionCreationFormProps {
  habitatId: string;
  userId: string;
  onSuccess: (discussion: Discussion) => void;
  onCancel: () => void;
  className?: string;
}

interface FormData {
  name: string;
  description: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  general?: string;
}

export function DiscussionCreationForm({
  habitatId,
  userId,
  onSuccess,
  onCancel,
  className = "",
}: DiscussionCreationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form data
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Validate name (3-100 characters)
    if (!formData.name.trim()) {
      newErrors.name = "Discussion name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Discussion name must be at least 3 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Discussion name must be no more than 100 characters";
    }

    // Validate description (max 500 characters, optional)
    if (formData.description.trim().length > 500) {
      newErrors.description = "Description must be no more than 500 characters";
    }

    return newErrors;
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
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
      const discussion = await habitatsService.createDiscussion(
        habitatId,
        formData.name.trim(),
        formData.description.trim() || undefined,
        userId
      );

      onSuccess(discussion);
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
      id="discussion-creation-form"
    >
      {/* General Error */}
      {errors.general && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {errors.general}
        </div>
      )}

      {/* Discussion Name */}
      <div className="space-y-2">
        <Label htmlFor="discussion-name">Discussion Name *</Label>
        <Input
          id="discussion-name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Enter discussion name"
          className={errors.name ? "border-red-500" : ""}
          disabled={isSubmitting}
          maxLength={100}
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        <p className="text-xs text-muted-foreground">
          {formData.name.length}/100 characters
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="discussion-description">Description (Optional)</Label>
        <textarea
          id="discussion-description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Enter discussion description"
          className={`w-full px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.description ? "border-red-500" : "border-input"
          }`}
          disabled={isSubmitting}
          rows={3}
          maxLength={500}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {formData.description.length}/500 characters
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
          {isSubmitting ? "Creating..." : "Create Discussion"}
        </Button>
      </div>
    </form>
  );
}
