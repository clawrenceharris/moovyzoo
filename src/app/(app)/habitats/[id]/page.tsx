"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { HabitatDashboard } from "@/features/habitats/components";
import { useUser } from "@/hooks/use-user";
import { errorMap } from "@/utils/error-map";
import { AppErrorCode } from "@/types/error";

export default function HabitatDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();

  // Extract habitat ID from params
  const habitatId = params.id as string;

  // Validate habitat ID format (UUID)
  const isValidUUID = (id: string): boolean => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // Show loading state while user is being fetched
  if (!user) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="border-b border-border bg-card/50 p-4">
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-lg bg-muted"></div>
            <div className="flex-1">
              <div className="h-6 bg-muted rounded w-48 mb-2"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Handle invalid habitat ID
  if (!habitatId || !isValidUUID(habitatId)) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center p-8 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h1 className="text-xl  text-foreground mb-2">
          {errorMap[AppErrorCode.HABITAT_NOT_FOUND].title}
        </h1>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {errorMap[AppErrorCode.HABITAT_NOT_FOUND].message}
        </p>

        <button
          onClick={() => router.push("/habitats")}
          className="px-4 py-2 text-sm  bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Back to Habitats
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background">
      <HabitatDashboard
        habitatId={habitatId}
        userId={user.id}
        className="h-full"
      />
    </div>
  );
}
