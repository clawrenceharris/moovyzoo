"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { MediaSearchField } from "@/components/media/MediaSearchField";
import { habitatsService } from "../domain/habitats.service";
import { normalizeError } from "@/utils/normalize-error";
import {
  createWatchPartyFormSchema,
  type CreateWatchPartyFormInput,
} from "../domain/habitats.schema";
import type {
  CreateWatchPartyFormData,
  WatchParty,
} from "../domain/habitats.types";
import type { SelectedMedia } from "@/utils/tmdb/service";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { FormLayout } from "@/components";

interface WatchPartyCreationFormProps {
  habitatId: string;
  userId: string;
  onSuccess: (watchParty: WatchParty) => void;
  onCancel: () => void;
  className?: string;
}

export function WatchPartyCreationForm({
  habitatId,
  userId,
  onSuccess,
  onCancel,

  className = "",
}: WatchPartyCreationFormProps) {
  // Initialize with current date/time + 1 hour
  const now = new Date();
  const futureTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

  // Handle form submission
  const onSubmit = async (data: CreateWatchPartyFormInput) => {
    const scheduledDateTime = new Date(
      `${data.scheduledDate}T${data.scheduledTime}`
    );
    const maxParticipants = data.maxParticipants?.trim()
      ? parseInt(data.maxParticipants.trim())
      : undefined;

    const watchParty = await habitatsService.createWatchParty(
      habitatId,
      userId,
      {
        description: data.description?.trim() || undefined,
        scheduledTime: scheduledDateTime.toISOString(),
        maxParticipants,
        media: data.media,
        title: data.title,
      }
    );

    onSuccess(watchParty);
  };

  return (
    <FormLayout<CreateWatchPartyFormData>
      resolver={zodResolver(createWatchPartyFormSchema)}
      onSubmit={onSubmit}
    >
      {({
        register,
        setValue,
        watch,
        resetField,
        formState: { isSubmitting, errors },
      }) => {
        const watchedValues = watch();
        const handleMediaSelect = (media: SelectedMedia | null) => {
          if (media) {
            setValue("media", {
              tmdb_id: media.tmdb_id,
              media_type: media.media_type,
              media_title: "",
              poster_path: media.poster_path,
              release_date: media.release_date,
              runtime: media.runtime,
            });
          } else {
            resetField("media");
          }
        };
        return (
          <>
            {errors.root && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {errors.root.message}
              </div>
            )}
            {/* Media Search Field */}
            <FormItem className="space-y-2">
              <FormLabel>What do you want to watch?</FormLabel>
              <MediaSearchField
                onMediaSelect={handleMediaSelect}
                selectedMedia={
                  watchedValues.media
                    ? {
                        tmdb_id: watchedValues.media.tmdb_id,
                        media_type: watchedValues.media.media_type,
                        media_title: watchedValues.media.media_title,
                        poster_path: watchedValues.media.poster_path,
                        release_date: watchedValues.media.release_date,
                        runtime: watchedValues.media.runtime,
                      }
                    : null
                }
                placeholder="Search for a movie or TV show to watch..."
                disabled={isSubmitting}
                className={errors.media ? "border-red-500" : ""}
              />
              {errors.media && (
                <p className="text-sm text-red-600">{errors.media.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Add a movie or TV show to help others know what you&apos;ll be
                watching
              </p>
            </FormItem>

            <FormItem className="space-y-2">
              <FormLabel htmlFor="party-title">Watch Party Title</FormLabel>
              <Input
                id="party-title"
                type="text"
                placeholder="Enter watch party title"
                className={errors.title ? "border-red-500" : ""}
                disabled={isSubmitting}
                maxLength={200}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {watchedValues.title?.length || 0}/200 characters
              </p>
            </FormItem>
            {/* Scheduled Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <FormItem className="space-y-2">
                <FormLabel htmlFor="scheduled-date">Scheduled Date</FormLabel>
                <Input
                  id="scheduled-date"
                  type="date"
                  className={errors.scheduledDate ? "border-red-500" : ""}
                  disabled={isSubmitting}
                  min={new Date().toISOString().split("T")[0]}
                  {...register("scheduledDate")}
                />
              </FormItem>
              <FormItem className="space-y-2">
                <FormLabel htmlFor="scheduled-time">Scheduled Time *</FormLabel>
                <Input
                  {...register("scheduledTime")}
                  name="schedule"
                  id="scheduled-time"
                  type="time"
                  className={errors.scheduledTime ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
              </FormItem>
            </div>
            {(errors.scheduledDate || errors.scheduledTime) && (
              <p className="text-sm text-red-600">
                {errors.scheduledDate?.message || errors.scheduledTime?.message}
              </p>
            )}

            {/* Max Participants */}
            <FormItem className="space-y-2">
              <FormLabel htmlFor="max-participants">
                Maximum Participants (Optional)
              </FormLabel>
              <Input
                id="max-participants"
                type="number"
                {...register("maxParticipants")}
                placeholder="Leave empty for unlimited"
                className={errors.maxParticipants ? "border-red-500" : ""}
                disabled={isSubmitting}
                min="2"
                max="100"
              />
              {errors.maxParticipants && (
                <p className="text-sm text-red-600">
                  {errors.maxParticipants.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Leave empty for unlimited participants
              </p>
            </FormItem>
          </>
        );
      }}
    </FormLayout>
  );
}
