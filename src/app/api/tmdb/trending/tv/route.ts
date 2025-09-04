import { NextRequest, NextResponse } from 'next/server';
import { getTrendingOrAiringTV } from '../../repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get('kind') as 'trending' | 'on_the_air' | 'airing_today' | 'popular' | 'top_rated';
    const region = searchParams.get('region') || undefined;

    if (!kind || !['trending', 'on_the_air', 'airing_today', 'popular', 'top_rated'].includes(kind)) {
      return NextResponse.json(
        { error: 'Kind parameter is required and must be "trending", "on_the_air", "airing_today", "popular", or "top_rated"' },
        { status: 400 }
      );
    }

    const tvShows = await getTrendingOrAiringTV(kind, region);
    return NextResponse.json({ tvShows, kind, region });
  } catch (error) {
    console.error('Error in trending TV API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get trending TV shows' },
      { status: 500 }
    );
  }
}
