import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MovieService } from '@/lib/services/movie.service';
import { MovieRepository } from '@/lib/repositories/movie.repository';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api.utils';
import { handleError } from '@/lib/utils/error.utils';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const movieRepository = new MovieRepository(supabase);
    const movieService = new MovieService(movieRepository);

    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get('title');
    const genre = searchParams.get('genre');

    let movies;
    if (title) {
      movies = await movieService.searchMoviesByTitle(title);
    } else if (genre) {
      movies = await movieService.getMoviesByGenre(genre);
    } else {
      movies = await movieService.getAllMovies();
    }

    return NextResponse.json(createSuccessResponse(movies));
  } catch (error) {
    const appError = handleError(error);
    return NextResponse.json(
      createErrorResponse(appError.message),
      { status: appError.statusCode }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const movieRepository = new MovieRepository(supabase);
    const movieService = new MovieService(movieRepository);

    const data = await request.json();
    const movie = await movieService.createMovie(data);

    return NextResponse.json(createSuccessResponse(movie), { status: 201 });
  } catch (error) {
    const appError = handleError(error);
    return NextResponse.json(
      createErrorResponse(appError.message),
      { status: appError.statusCode }
    );
  }
} 