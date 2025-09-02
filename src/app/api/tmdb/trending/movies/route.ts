import { NextRequest, NextResponse } from 'next/server';
import { getTrendingNowOrUpcoming } from '../../repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'trending' | 'now_playing' | 'upcoming';

    if (!type || !['trending', 'now_playing', 'upcoming'].includes(type)) {
      return NextResponse.json(
        { error: 'Type parameter is required and must be "trending", "now_playing", or "upcoming"' },
        { status: 400 }
      );
    }

    const movies = await getTrendingNowOrUpcoming(type);
    return NextResponse.json({ movies, type });
  } catch (error) {
    console.error('Error in trending movies API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get trending movies' },
      { status: 500 }
    );
  }
}
