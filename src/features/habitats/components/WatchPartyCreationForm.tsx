"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { MediaSearchField } from "@/components/media/MediaSearchField";
import { habitatsService } from "../domain/habitats.service";
import {
  createWatchPartyFormSchema,
  type CreateWatchPartyFormInput,
} from "../domain/habitats.schema";
import type {
  CreateWatchPartyFormData,
  SelectedMedia,
  WatchParty,
} from "../domain/habitats.types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormLayout } from "@/components";
import { TMDBSearchResult } from "@/features/ai-chat/data/tmdb.repository";

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
        setValue,
        watch,
        control,
        resetField,
        formState: { isSubmitting, errors },
      }) => {
        const watchedValues = watch();
        const handleMediaSelect = (media: SelectedMedia | null) => {
          if (media) {
            setValue("media", {
              tmdb_id: media.tmdb_id,
              media_type: media.media_type,
              media_title: media.media_title,
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
            <FormField
              name="media"
              control={control}
              defaultValue={{} as SelectedMedia}
              render={() => (
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
                  />
                  {errors.media && (
                    <FormMessage className="text-sm text-red-600">
                      {errors.media.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />

            {/* Scheduled Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="scheduledDate"
                defaultValue=""
                control={control}
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="scheduled-date">
                      Scheduled Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="scheduled-date"
                        type="date"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="scheduledTime"
                defaultValue=""
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="scheduled-time">
                      Scheduled Time
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="scheduled-time"
                        type="time"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            {(errors.scheduledDate || errors.scheduledTime) && (
              <FormMessage>
                {errors.scheduledDate?.message || errors.scheduledTime?.message}
              </FormMessage>
            )}

            {/* Max Participants */}
            <FormField
              defaultValue=""
              control={control}
              name="maxParticipants"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="sr-only" htmlFor="max-participants">
                    Maximum Participants (Optional)
                  </FormLabel>
                  <Input
                    id="max-participants"
                    type="number"
                    placeholder="Maximum Participants"
                    className={errors.maxParticipants ? "border-red-500" : ""}
                    disabled={isSubmitting}
                    {...field}
                  />
                  {errors.maxParticipants && (
                    <FormMessage>{errors.maxParticipants.message}</FormMessage>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Leave empty for unlimited participants
                  </p>
                </FormItem>
              )}
            />
          </>
        );
      }}
    </FormLayout>
  );
}
