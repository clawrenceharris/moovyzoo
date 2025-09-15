import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { serverRecommendationsService } from '@/features/ai-recommendations/domain/recommendations.server-factory';
import { normalizeError, getUserErrorMessage } from '@/utils/normalize-error';
import { AppErrorCode } from '@/utils/error-codes';
import { recommendationsRateLimiter } from '@/utils/rate-limiter';

/**
 * GET /api/recommendations - Fetch user's personalized recommendations
 */
export async function GET(request: NextRequest) {
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

    // Check rate limit
    if (!recommendationsRateLimiter.isAllowed(user.id)) {
      return NextResponse.json(
        {
          success: false,
          error: getUserErrorMessage(AppErrorCode.RATE_LIMIT_EXCEEDED),
          code: AppErrorCode.RATE_LIMIT_EXCEEDED,
          retryAfter: Math.ceil(recommendationsRateLimiter.getTimeUntilReset(user.id) / 1000)
        },
        { status: 429 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('force_refresh') === 'true';
    
    // Generate session ID from user ID and current date for daily cache
    // Added suffix to force cache invalidation after server repo changes
    const sessionId = `${user.id}-${new Date().toISOString().split('T')[0]}-server-fix`;

    // Get recommendations using server service
    const recommendations = await serverRecommendationsService.getRecommendations(
      user.id,
      sessionId,
      forceRefresh,
      supabase
    );

    return NextResponse.json({
      success: true,
      data: {
        content_recommendations: recommendations.content_recommendations,
        friend_suggestions: recommendations.friend_suggestions,
        cached: recommendations.cached,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Recommendations fetch error:', error);

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