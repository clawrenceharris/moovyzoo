import { NextRequest, NextResponse } from 'next/server';
import { getMovieDetails } from '../../repository';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const movieId = parseInt(id, 10);

    if (isNaN(movieId)) {
      return NextResponse.json(
        { error: 'Movie ID must be a valid number' },
        { status: 400 }
      );
    }

    const movieDetails = await getMovieDetails(movieId);
    return NextResponse.json({ movieDetails });
  } catch (error) {
    console.error('Error in movie details API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get movie details' },
      { status: 500 }
    );
  }
}
