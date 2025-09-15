import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { serverRecommendationsService } from '@/features/ai-recommendations/domain/recommendations.server-factory';
import { normalizeError, getUserErrorMessage } from '@/utils/normalize-error';
import { AppErrorCode } from '@/utils/error-codes';
import { refreshRateLimiter } from '@/utils/rate-limiter';
import { z } from 'zod';

/**
 * Schema for refresh recommendations request
 */
const refreshRecommendationsSchema = z.object({
  force_refresh: z.boolean().optional().default(true)
});

/**
 * POST /api/recommendations/refresh - Refresh user's recommendations
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: getUserErrorMessage(AppErrorCode.UNAUTHORIZED),
          code: AppErrorCode.UNAUTHORIZED
        },
        { status: 401 }
      );
    }

    // Check rate limit for refresh endpoint (more restrictive)
    if (!refreshRateLimiter.isAllowed(user.id)) {
      return NextResponse.json(
        {
          success: false,
          error: getUserErrorMessage(AppErrorCode.RATE_LIMIT_EXCEEDED),
          code: AppErrorCode.RATE_LIMIT_EXCEEDED,
          retryAfter: Math.ceil(refreshRateLimiter.getTimeUntilReset(user.id) / 1000)
        },
        { status: 429 }
      );
    }

    // Parse and validate request body (optional)
    let validatedData = { force_refresh: true };
    try {
      const body = await request.json();
      const validationResult = refreshRecommendationsSchema.safeParse(body);
      if (validationResult.success) {
        validatedData = validationResult.data;
      }
    } catch {
      // If no body or invalid JSON, use defaults
    }

    // Generate session ID from user ID and current date for daily cache
    // Added suffix to force cache invalidation after server repo changes
    const sessionId = `${user.id}-${new Date().toISOString().split('T')[0]}-server-fix`;

    // Refresh recommendations using server service
    const recommendations = await serverRecommendationsService.refreshRecommendations(
      user.id,
      sessionId,
      supabase
    );

    return NextResponse.json({
      success: true,
      data: {
        content_recommendations: recommendations.content_recommendations,
        friend_suggestions: recommendations.friend_suggestions,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Recommendations refresh error:', error);

    const normalizedError = normalizeError(error);

    return NextResponse.json(
      {
        success: false,
        error: getUserErrorMessage(normalizedError),
        code: normalizedError.code
      },
      { status: 500 }
    );
  }
}