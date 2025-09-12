import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { friendsServerRepository } from '@/features/profile/data/friends.server';
import { normalizeError, getUserErrorMessage } from '@/utils/normalize-error';
import { AppErrorCode } from '@/utils/error-codes';
import { z } from 'zod';

/**
 * Schema for friend request action
 */
const friendRequestActionSchema = z.object({
  action: z.enum(['accept', 'decline']),
});

/**
 * DELETE /api/friends/[requestId] - Remove a friend (unfriend)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
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

    // Validate friendship ID format
    const friendshipId = params.requestId;
    if (!friendshipId || typeof friendshipId !== 'string') {
      return NextResponse.json(
        { 
          error: getUserErrorMessage(AppErrorCode.INVALID_UUID),
          code: AppErrorCode.INVALID_UUID 
        },
        { status: 400 }
      );
    }

    // Remove the friendship
    await friendsServerRepository.removeFriendByFriendshipId(friendshipId, user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Friend removed successfully'
    });

  } catch (error) {
    console.error('Remove friend error:', error);
    
    const normalizedError = normalizeError(error);
    
    // Handle specific friend-related errors
    if (normalizedError.code === AppErrorCode.FRIEND_REQUEST_NOT_FOUND) {
      return NextResponse.json(
        { 
          error: getUserErrorMessage(AppErrorCode.FRIEND_REQUEST_NOT_FOUND),
          code: AppErrorCode.FRIEND_REQUEST_NOT_FOUND 
        },
        { status: 404 }
      );
    }

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

/**
 * PATCH /api/friends/[requestId] - Accept or decline a friend request
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
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

    // Validate request ID format
    const requestId = params.requestId;
    if (!requestId || typeof requestId !== 'string') {
      return NextResponse.json(
        { 
          error: getUserErrorMessage(AppErrorCode.INVALID_UUID),
          code: AppErrorCode.INVALID_UUID 
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = friendRequestActionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: getUserErrorMessage(AppErrorCode.VALIDATION_ERROR),
          code: AppErrorCode.VALIDATION_ERROR,
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { action } = validationResult.data;

    // Perform the requested action
    if (action === 'accept') {
      const friendship = await friendsServerRepository.acceptFriendRequest(requestId);
      
      return NextResponse.json({
        success: true,
        data: {
          id: friendship.id,
          status: friendship.status,
          updatedAt: friendship.updatedAt,
        }
      });
    } else {
      // Decline action
      await friendsServerRepository.declineFriendRequest(requestId);
      
      return NextResponse.json({
        success: true,
        message: 'Friend request declined successfully'
      });
    }

  } catch (error) {
    console.error('Friend request action error:', error);
    
    const normalizedError = normalizeError(error);
    
    // Handle specific friend-related errors
    if (normalizedError.code === AppErrorCode.FRIEND_REQUEST_NOT_FOUND) {
      return NextResponse.json(
        { 
          error: getUserErrorMessage(AppErrorCode.FRIEND_REQUEST_NOT_FOUND),
          code: AppErrorCode.FRIEND_REQUEST_NOT_FOUND 
        },
        { status: 404 }
      );
    }

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