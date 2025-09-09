import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { friendsServerRepository } from '@/features/profile/data/friends.server';
import { normalizeError, getUserErrorMessage } from '@/utils/normalize-error';
import { AppErrorCode } from '@/utils/error-codes';
import { z } from 'zod';

/**
 * Schema for friend request creation
 */
const createFriendRequestSchema = z.object({
  receiverId: z.string().uuid('Invalid user ID format'),
});

/**
 * POST /api/friends - Send a friend request
 */
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createFriendRequestSchema.safeParse(body);

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

    const { receiverId } = validationResult.data;

    // Send friend request using repository
    const friendship = await friendsServerRepository.sendFriendRequest(user.id, receiverId);

    return NextResponse.json({
      success: true,
      data: {
        id: friendship.id,
        status: friendship.status,
        createdAt: friendship.createdAt,
      }
    });

  } catch (error) {
    console.error('Friend request creation error:', error);
    
    const normalizedError = normalizeError(error);
    
    // Handle specific friend-related errors
    if (normalizedError.code === AppErrorCode.CANNOT_FRIEND_SELF) {
      return NextResponse.json(
        { 
          error: getUserErrorMessage(AppErrorCode.CANNOT_FRIEND_SELF),
          code: AppErrorCode.CANNOT_FRIEND_SELF 
        },
        { status: 400 }
      );
    }

    if (normalizedError.code === AppErrorCode.FRIEND_REQUEST_ALREADY_EXISTS) {
      return NextResponse.json(
        { 
          error: getUserErrorMessage(AppErrorCode.FRIEND_REQUEST_ALREADY_EXISTS),
          code: AppErrorCode.FRIEND_REQUEST_ALREADY_EXISTS 
        },
        { status: 409 }
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