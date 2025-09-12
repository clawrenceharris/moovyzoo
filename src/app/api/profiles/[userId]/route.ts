import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { profilesServerRepository } from "@/features/profile/data/profiles.server";
import { AppErrorCode } from "@/utils/error-codes";
import { errorMap } from "@/utils/error-map";

/**
 * GET /api/profiles/[userId]
 * Returns detailed profile view with friend status and recent watch history
 * Respects privacy settings and friendship status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    const { userId } = params;

    // Validate userId parameter
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Get profile with friend status and watch history
    const profile = await profilesServerRepository.getProfileWithFriendStatus(
      userId,
      user.id
    );

    return NextResponse.json({ profile });

  } catch (error) {
    console.error("Error fetching profile:", error);
    
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

    // Handle profile not found
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}