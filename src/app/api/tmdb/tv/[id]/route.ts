import { NextRequest, NextResponse } from 'next/server';
import { getTVShowDetails } from '../../repository';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tvId = parseInt(id, 10);

    if (isNaN(tvId)) {
      return NextResponse.json(
        { error: 'TV show ID must be a valid number' },
        { status: 400 }
      );
    }

    const tvShowDetails = await getTVShowDetails(tvId);
    return NextResponse.json({ tvShowDetails });
  } catch (error) {
    console.error('Error in TV show details API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get TV show details' },
      { status: 500 }
    );
  }
}
