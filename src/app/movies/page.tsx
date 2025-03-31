import React from 'react'
import Link from 'next/link'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import SearchBar from '@/components/search/SearchBar'
import { MOVIE_GENRES } from '@/lib/constants/genres'

interface MovieGenre {
  genres: {
    name: string
  } | null
}

interface Movie {
  id: string
  title: string
  description: string
  thumbnail_url: string
  movie_genres: MovieGenre[]
}

async function getMovies(genre?: string, searchQuery?: string): Promise<Movie[]> {
  const supabase = createServerComponentClient({ cookies })

  let query = supabase
    .from('movies')
    .select(`
      *,
      movie_genres!inner (
        genres!inner (
          name
        )
      )
    `)

  if (genre) {
    query = query.eq('movie_genres.genres.name', genre)
  }

  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`)
  }

  const { data: movies, error } = await query

  if (error) {
    console.error('Error fetching movies:', error)
    return []
  }

  return movies || []
}

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: { genre?: string; q?: string }
}) {
  const movies = await getMovies(searchParams.genre, searchParams.q)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Movies</h1>
        <SearchBar />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/movies"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 
            ${!searchParams.genre 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
        >
          All
        </Link>
        {MOVIE_GENRES.map((genre) => (
          <Link
            key={genre}
            href={`/movies?genre=${genre}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 
              ${searchParams.genre === genre
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
          >
            {genre}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            href={`/movies/${movie.id}`}
            className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:scale-105 dark:bg-gray-800"
          >
            <div className="relative pb-[140%]">
              <img
                src={movie.thumbnail_url}
                alt={movie.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="p-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1">{movie.title}</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{movie.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {movie.movie_genres
                  .filter((mg): mg is MovieGenre & { genres: { name: string } } => mg.genres !== null)
                  .map((mg) => (
                    <span
                      key={mg.genres.name}
                      className="inline-flex items-center rounded-full bg-indigo-100 px-1.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                    >
                      {mg.genres.name}
                    </span>
                  ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 