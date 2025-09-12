"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MediaSearchField } from "@/components/media/MediaSearchField";
import { habitatsService } from "../../habitats/domain/habitats.service";
import {
  createStreamFormSchema,
  type CreateStreamFormInput,
} from "../../habitats/domain/habitats.schema";
import type {
  CreateStreamFormData,
  SelectedMedia,
} from "../../habitats/domain/habitats.types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  FormLayout,
  Calendar,
  PopoverContent,
  PopoverTrigger,
  Button,
  Popover,
  Label,
  FormDescription,
} from "@/components";
import { Stream } from "@/features/streaming";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { format, formatDate } from "date-fns";
import { cn } from "@/lib/utils";

interface StreamCreationFormProps {
  habitatId: string;
  userId: string;
  isLoading: boolean;
  onSuccess: (stream: Stream) => void;
  onCancel: () => void;
  className?: string;
}

export function StreamCreationForm({
  habitatId,
  userId,
  isLoading,
  onSuccess,
}: StreamCreationFormProps) {
  const now = new Date();
  const [isOpen, setIsOpen] = useState(false);
  const onSubmit = async (data: CreateStreamFormInput) => {
    const normalizedDate = data.scheduledDate.split("T")[0];

    const scheduledDateTime = new Date(
      `${normalizedDate}T${data.scheduledTime}`
    );
    const maxParticipants = data.maxParticipants?.trim()
      ? parseInt(data.maxParticipants.trim())
      : undefined;

    const stream = await habitatsService.createHabitatStream(
      userId,
      habitatId,

      {
        description: data.description?.trim() || undefined,
        scheduledTime: scheduledDateTime.toISOString(),
        maxParticipants,
        media: data.media,
      }
    );

    onSuccess(stream);
  };
  return (
    <FormLayout<CreateStreamFormData>
      resolver={zodResolver(createStreamFormSchema)}
      onSubmit={onSubmit}
      isLoading={isLoading}
      defaultValues={{
        scheduledTime: now.toTimeString().slice(0, 5),
        scheduledDate: now.toISOString(),
      }}
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
            <FormItem className="space-y-2">
              <Label htmlFor="media">What do you want to watch?</Label>
              <MediaSearchField
                id="media"
                name="media"
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
              />

              {errors.media && (
                <FormMessage>{errors.media.message}</FormMessage>
              )}
            </FormItem>

            {/* Scheduled Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="scheduledDate"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>

                    <Popover open={isOpen} onOpenChange={setIsOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full border-none h-12 rounded-[10px] justify-start text-left font-normal",
                            !watchedValues.scheduledDate &&
                              "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {watchedValues.scheduledDate ? (
                            format(watchedValues.scheduledDate, "MM/dd/yyyy")
                          ) : (
                            <span>MM/DD/YYYY</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <FormControl>
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                setValue("scheduledDate", date.toISOString()); // Update form state
                                setIsOpen(false);
                              }
                            }}
                          />
                        </FormControl>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="scheduledTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        type="time"
                        step="60"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormMessage />
              {(errors.scheduledDate || errors.scheduledTime) && (
                <FormMessage>
                  {errors.scheduledDate?.message ||
                    errors.scheduledTime?.message}
                </FormMessage>
              )}
            </div>

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
                  <FormControl>
                    <Input
                      id="max-participants"
                      type="number"
                      placeholder="Maximum Participants"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />

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
