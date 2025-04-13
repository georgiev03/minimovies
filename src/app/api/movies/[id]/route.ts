import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MovieService } from '@/lib/services/movie.service';
import { MovieRepository } from '@/lib/repositories/movie.repository';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api.utils';
import { handleError } from '@/lib/utils/error.utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const movieRepository = new MovieRepository(supabase);
    const movieService = new MovieService(movieRepository);

    const movie = await movieService.getMovieById(params.id);
    if (!movie) {
      return NextResponse.json(
        createErrorResponse('Movie not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(createSuccessResponse(movie));
  } catch (error) {
    const appError = handleError(error);
    return NextResponse.json(
      createErrorResponse(appError.message),
      { status: appError.statusCode }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const movieRepository = new MovieRepository(supabase);
    const movieService = new MovieService(movieRepository);

    const data = await request.json();
    const movie = await movieService.updateMovie(params.id, data);

    return NextResponse.json(createSuccessResponse(movie));
  } catch (error) {
    const appError = handleError(error);
    return NextResponse.json(
      createErrorResponse(appError.message),
      { status: appError.statusCode }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const movieRepository = new MovieRepository(supabase);
    const movieService = new MovieService(movieRepository);

    await movieService.deleteMovie(params.id);

    return NextResponse.json(createSuccessResponse(null), { status: 204 });
  } catch (error) {
    const appError = handleError(error);
    return NextResponse.json(
      createErrorResponse(appError.message),
      { status: appError.statusCode }
    );
  }
} 