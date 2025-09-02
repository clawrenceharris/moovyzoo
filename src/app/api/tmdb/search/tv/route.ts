import { NextRequest, NextResponse } from 'next/server';
import { searchTVShow } from '../../repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    const yearParam = searchParams.get('year');

    if (!title) {
      return NextResponse.json(
        { error: 'Title parameter is required' },
        { status: 400 }
      );
    }

    const year = yearParam ? parseInt(yearParam, 10) : undefined;
    if (yearParam && isNaN(year!)) {
      return NextResponse.json(
        { error: 'Year must be a valid number' },
        { status: 400 }
      );
    }

    const tvShows = await searchTVShow(title, year);
    return NextResponse.json({ tvShows });
  } catch (error) {
    console.error('Error in search/tv API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search TV shows' },
      { status: 500 }
    );
  }
}
