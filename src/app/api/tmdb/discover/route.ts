import { NextRequest, NextResponse } from 'next/server';
import { discoverByGenre } from '../repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const genreIds = searchParams.get('genreIds');
    const yearParam = searchParams.get('year');
    const sortBy = searchParams.get('sortBy') || 'popularity.desc';

    if (!genreIds) {
      return NextResponse.json(
        { error: 'genreIds parameter is required' },
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

    const movies = await discoverByGenre(genreIds, year, sortBy);
    return NextResponse.json({ movies });
  } catch (error) {
    console.error('Error in discover movies API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to discover movies' },
      { status: 500 }
    );
  }
}
