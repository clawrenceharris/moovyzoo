import { NextRequest, NextResponse } from 'next/server';
import { getSimilarOrRecommendationsTV } from '../../../repository';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'similar' | 'recommendations' || 'similar';
    
    const { id } = await params;
    const tvId = parseInt(id, 10);

    if (isNaN(tvId)) {
      return NextResponse.json(
        { error: 'TV show ID must be a valid number' },
        { status: 400 }
      );
    }

    if (!['similar', 'recommendations'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "similar" or "recommendations"' },
        { status: 400 }
      );
    }

    const tvShows = await getSimilarOrRecommendationsTV(tvId, type);
    return NextResponse.json({ tvShows, type });
  } catch (error) {
    console.error('Error in similar/recommendations TV API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get similar/recommended TV shows' },
      { status: 500 }
    );
  }
}
