import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { watchHistoryServerRepository } from '@/features/profile/data/watch-history.server';
import { normalizeError, getUserErrorMessage } from '@/utils/normalize-error';
import { AppErrorCode } from '@/utils/error-codes';
import { z } from 'zod';

/**
 * Schema for watch history entry creation
 */
const createWatchHistorySchema = z.object({
  movieId: z.string().min(1, 'Movie ID is required'),
  title: z.string().min(1, 'Title is required'),
  posterUrl: z.string().optional(),
  mediaType: z.enum(['movie', 'tv'], {
    errorMap: () => ({ message: 'Media type must be either "movie" or "tv"' })
  }),
  status: z.enum(['watched', 'watching', 'dropped'], {
    errorMap: () => ({ message: 'Status must be "watched", "watching", or "dropped"' })
  }),
  rating: z.number().min(1).max(10).optional(),
  watchedAt: z.string().datetime().optional(),
});

/**
 * GET /api/watch-history - Fetch user's watch history
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || user.id;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const isRecent = searchParams.get('recent') === 'true';

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { 
          error: getUserErrorMessage(AppErrorCode.VALIDATION_ERROR),
          code: AppErrorCode.VALIDATION_ERROR,
          details: { message: 'Limit must be between 1 and 100' }
        },
        { status: 400 }
      );
    }

    // Fetch watch history using repository
    const entries = isRecent 
      ? await watchHistoryServerRepository.getRecentActivity(userId, limit)
      : await watchHistoryServerRepository.getUserWatchHistory(userId, limit);

    return NextResponse.json({
      success: true,
      entries: entries.map(entry => ({
        id: entry.id,
        movieId: entry.movieId,
        title: entry.title,
        posterUrl: entry.posterUrl,
        mediaType: entry.mediaType,
        status: entry.status,
        rating: entry.rating,
        watchedAt: entry.watchedAt.toISOString(),
      }))
    });

  } catch (error) {
    console.error('Watch history fetch error:', error);
    
    const normalizedError = normalizeError(error);
    
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
 * POST /api/watch-history - Add or update a watch history entry
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
    const validationResult = createWatchHistorySchema.safeParse(body);

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

    const { movieId, title, posterUrl, mediaType, status, rating, watchedAt } = validationResult.data;

    // Create watch history entry using repository
    const watchEntry = await watchHistoryServerRepository.addWatchEntry({
      userId: user.id,
      movieId,
      title,
      posterUrl,
      mediaType,
      status,
      rating,
      watchedAt: watchedAt ? new Date(watchedAt) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: watchEntry.id,
        movieId: watchEntry.movieId,
        title: watchEntry.title,
        posterUrl: watchEntry.posterUrl,
        mediaType: watchEntry.mediaType,
        status: watchEntry.status,
        rating: watchEntry.rating,
        watchedAt: watchEntry.watchedAt.toISOString(),
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Watch history creation error:', error);
    
    const normalizedError = normalizeError(error);
    
    // Handle specific TMDB validation errors
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (
        message.includes('tmdb') || 
        message.includes('valid title') ||
        message.includes('media type') ||
        message.includes('rating must be') ||
        message.includes('poster url')
      ) {
        return NextResponse.json(
          { 
            error: getUserErrorMessage(AppErrorCode.WATCH_HISTORY_INVALID),
            code: AppErrorCode.WATCH_HISTORY_INVALID,
            details: { message: error.message }
          },
          { status: 400 }
        );
      }
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