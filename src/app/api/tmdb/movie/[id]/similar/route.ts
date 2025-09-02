import { NextRequest, NextResponse } from 'next/server';
import { getSimilarMovies } from '../../../repository';

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

    const similarMovies = await getSimilarMovies(movieId);
    return NextResponse.json({ similarMovies });
  } catch (error) {
    console.error('Error in similar movies API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get similar movies' },
      { status: 500 }
    );
  }
}
