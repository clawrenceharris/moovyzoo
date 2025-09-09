import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { friendsServerRepository } from '@/features/profile/data/friends.server';
import { normalizeError, getUserErrorMessage } from '@/utils/normalize-error';
import { AppErrorCode } from '@/utils/error-codes';

/**
 * GET /api/friends/requests - Get pending friend requests for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { 
          error: getUserErrorMessage(AppErrorCode.UNAUTHORIZED),
          code: AppErrorCode.UNAUTHORIZED 
        },
        { status: 401 }
      );
    }

    // Get pending friend requests
    const pendingRequests = await friendsServerRepository.getPendingRequests(user.id);

    return NextResponse.json({
      success: true,
      data: {
        requests: pendingRequests,
        count: pendingRequests.length
      }
    });

  } catch (error) {
    console.error('Get friend requests error:', error);
    
    const normalizedError = normalizeError(error);
    
    // Generic error response
    return NextResponse.json(
      { 
        error: getUserErrorMessage(normalizedError),
        code: normalizedError.code 
      },
      { status: 500 }
    );
  }
}