import { NextRequest, NextResponse } from 'next/server';
import { searchMovie } from '../../repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');

    if (!title) {
      return NextResponse.json(
        { error: 'Title parameter is required' },
        { status: 400 }
      );
    }

    const movies = await searchMovie(title);
    return NextResponse.json({ movies });
  } catch (error) {
    console.error('Error in search/movies API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search movies' },
      { status: 500 }
    );
  }
}
