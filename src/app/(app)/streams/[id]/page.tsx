import React, { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/states";
import { getImageUrl } from "@/features/ai-chat";
import { StreamPageClient } from "./StreamingPageClient";
import type {
  StreamWithParticipants,
  StreamParticipant,
  UserParticipationStatus,
} from "@/features/streaming/domain/stream.types";
import { StreamService } from "@/features/streaming";

interface StreamingPageProps {
  params: { id: string };
}

interface StreamPageData {
  stream: StreamWithParticipants;
  participants: StreamParticipant[];
  userParticipation: UserParticipationStatus;
  canJoin: boolean;
  canLeave: boolean;
  hasViewPermission: boolean;
}

interface StreamVisibility {
  type: "public" | "unlisted" | "private";
  allowedParticipants?: string[];
}

// Validate streaming session ID format (UUID)
const isValidUUID = (id: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Get streaming session visibility (mock implementation for now)
const getStreamVisibility = (
  stream: StreamWithParticipants
): StreamVisibility => {
  // For now, assume all sessions are public
  // In a real implementation, this would check the session's visibility settings
  return { type: "public" };
};

// Check if user has permission to view the session
const checkViewPermission = (
  visibility: StreamVisibility,
  userId?: string
): boolean => {
  switch (visibility.type) {
    case "public":
      return true;
    case "unlisted":
      return true; // Anyone with the link can view
    case "private":
      return !!userId && !!visibility.allowedParticipants?.includes(userId);
    default:
      return false;
  }
};

// Server-side data fetching for SEO and performance
async function getStreamData(id: string): Promise<StreamPageData | null> {
  try {
    if (!isValidUUID(id)) {
      return null;
    }
    const streamService = new StreamService();
    const stream = await streamService.getStream(id);

    if (!stream) {
      return null;
    }

    const participants = await streamService.getParticipants(id);
    const visibility = getStreamVisibility(stream);

    return {
      stream: stream,
      participants,
      userParticipation: {
        isParticipant: false,
        canJoin: true,
        canLeave: false,
      },
      canJoin: true,
      canLeave: false,
      hasViewPermission: checkViewPermission(visibility),
    };
  } catch (error) {
    console.error("Error fetching streaming session data:", error);
    return null;
  }
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({
  params,
}: StreamingPageProps): Promise<Metadata> {
  const data = await getStreamData(params.id);

  if (!data?.stream) {
    return {
      title: "Streaming Session Not Found - Zoovie",
      description: "This streaming session could not be found.",
    };
  }

  const { stream } = data;
  const visibility = getStreamVisibility(stream);

  // For private sessions, use generic metadata to protect privacy
  if (visibility.type === "private") {
    return {
      title: "Private Streaming Session - Zoovie",
      description:
        "Join your friends for a private streaming session on Zoovie.",
      robots: "noindex, nofollow",
    };
  }

  const title = `${stream.media_title} - Streaming Session`;
  const description =
    stream.description ||
    `Join the streaming session for ${stream.media_title} on Zoovie.`;

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Zoovie",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };

  // Add poster image for public and unlisted sessions
  if (
    stream.poster_path &&
    (visibility.type === "public" || visibility.type === "unlisted")
  ) {
    const imageUrl = getImageUrl(stream.poster_path);
    if (imageUrl) {
      metadata.openGraph!.images = [
        {
          url: imageUrl,
          width: 500,
          height: 750,
          alt: `${stream.media_title} poster`,
        },
      ];
      metadata.twitter!.images = [imageUrl];
    }
  }

  // Add structured data for public sessions only
  if (visibility.type === "public") {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Event",
      name: stream.media_title,
      description: stream.description,
      startDate: stream.scheduled_time,
      eventStatus: "EventScheduled",
      eventAttendanceMode: "OnlineEventAttendanceMode",
      location: {
        "@type": "VirtualLocation",
        url: `${process.env.NEXT_PUBLIC_APP_URL}/streams/${stream.id}`,
      },
    };

    metadata.other = {
      "application/ld+json": JSON.stringify(structuredData),
    };
  }

  return metadata;
}

// Loading component for Suspense boundary
function StreamLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Hero skeleton */}
          <div className="relative overflow-hidden rounded-xl bg-card border border-border/50">
            <div className="aspect-[21/9] sm:aspect-[16/6] bg-muted animate-pulse" />
            <div className="p-6 -mt-20 z-10 relative">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-32 h-48 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                  <div className="h-20 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Actions skeleton */}
          <div className="flex gap-4">
            <div className="h-12 bg-muted rounded w-32 animate-pulse" />
            <div className="h-12 bg-muted rounded w-24 animate-pulse" />
          </div>

          {/* Participants skeleton */}
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded w-48 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error boundary component
function StreamError({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-md text-center">
        <ErrorState
          title="Failed to Load Streaming Session"
          message="We encountered an error while loading this streaming session. Please try again."
          onRetry={() => window.location.reload()}
        />
      </div>
    </div>
  );
}

// Main page component with server-side rendering
export default async function StreamingPage({ params }: StreamingPageProps) {
  const { id } = params;
  // Server-side data fetching
  const data = await getStreamData(id);

  // Handle not found
  if (!data) {
    notFound();
  }

  const { stream, participants } = data;
  const visibility = getStreamVisibility(stream);

  // Check view permission (server-side check for public sessions)
  if (!checkViewPermission(visibility)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4 py-8 max-w-md text-center">
          <ErrorState
            title="Access Denied"
            message="You don't have permission to view this streaming session."
            action={
              <button
                onClick={() => (window.location.href = "/streams")}
                className="btn btn-primary"
              >
                Browse Public Sessions
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Suspense fallback={<StreamLoading />}>
          <StreamPageClient
            initialData={data}
            streamId={id}
            visibility={visibility}
          />
        </Suspense>
      </div>
    </div>
  );
}
