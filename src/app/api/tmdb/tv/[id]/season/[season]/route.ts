import { NextRequest, NextResponse } from 'next/server';
import { getSeasonOrEpisode } from '../../../../repository';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; season: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const episodeParam = searchParams.get('episode');
    
    const { id, season } = await params;
    const tvId = parseInt(id, 10);
    const seasonNumber = parseInt(season, 10);
    const episodeNumber = episodeParam ? parseInt(episodeParam, 10) : undefined;

    if (isNaN(tvId)) {
      return NextResponse.json(
        { error: 'TV show ID must be a valid number' },
        { status: 400 }
      );
    }

    if (isNaN(seasonNumber)) {
      return NextResponse.json(
        { error: 'Season number must be a valid number' },
        { status: 400 }
      );
    }

    if (episodeParam && isNaN(episodeNumber!)) {
      return NextResponse.json(
        { error: 'Episode number must be a valid number' },
        { status: 400 }
      );
    }

    const result = await getSeasonOrEpisode(tvId, seasonNumber, episodeNumber);
    
    if (episodeNumber !== undefined) {
      return NextResponse.json({ episode: result });
    } else {
      return NextResponse.json({ season: result });
    }
  } catch (error) {
    console.error('Error in season/episode API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get season/episode details' },
      { status: 500 }
    );
  }
}
