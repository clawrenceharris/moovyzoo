import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { profilesServerRepository } from "@/features/profile/data/profiles.server";
import { AppErrorCode } from "@/utils/error-codes";
import { errorMap } from "@/utils/error-map";

/**
 * GET /api/profiles/discover
 * Returns paginated list of public profiles with friend status
 * Excludes current user from results
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50); // Max 50 profiles
    const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);

    // Get public profiles with friend status
    const profiles = await profilesServerRepository.getPublicProfilesWithFriendStatus(
      user.id,
      limit,
      offset
    );

    return NextResponse.json({
      profiles,
      pagination: {
        limit,
        offset,
        hasMore: profiles.length === limit, // Simple check - if we got full limit, there might be more
      },
    });

  } catch (error) {
    console.error("Error fetching profiles for discovery:", error);
    
    // Handle known error codes
    if (error instanceof Error && Object.values(AppErrorCode).includes(error.message as AppErrorCode)) {
      const errorInfo = errorMap[error.message as AppErrorCode];
      return NextResponse.json(
        { 
          error: errorInfo.message,
          code: error.message 
        },
        { status: 400 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      { error: "Failed to fetch profiles" },
      { status: 500 }
    );
  }
}