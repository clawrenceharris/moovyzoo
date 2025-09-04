import { NextRequest, NextResponse } from 'next/server';
import { getMovieGenres } from '../repository';

export async function GET(request: NextRequest) {
  try {
    const genres = await getMovieGenres();
    return NextResponse.json({ genres });
  } catch (error) {
    console.error('Error in movie genres API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get movie genres' },
      { status: 500 }
    );
  }
}
