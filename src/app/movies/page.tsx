'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import SearchBar from '@/components/search/SearchBar'
import { MOVIE_GENRES } from '@/lib/constants/genres'
import Tooltip from '../components/Tooltip'
import { useTheme } from '@/lib/contexts/ThemeContext'

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

export default function MoviesPage({ searchParams }: { searchParams: { genre?: string; q?: string } }) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [tooltip, setTooltip] = useState<{visible: boolean, content: string, x: number, y: number}>({visible: false, content: '', x: 0, y: 0})
  const supabase = createClientComponentClient()
  const { isDark } = useTheme()

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true)
      let movieIds: string[] = []
      if (searchParams.genre) {
        const { data: genreMovies } = await supabase
          .from('movie_genres')
          .select('movie_id, genres!inner(name)')
          .eq('genres.name', searchParams.genre)
        movieIds = (genreMovies || []).map(m => m.movie_id)
      }
      let query = supabase
        .from('movies')
        .select(`
          *,
          movie_genres (
            genres (
              name
            )
          )
        `)
      if (searchParams.genre) {
        query = query.in('id', movieIds)
      }
      if (searchParams.q) {
        query = query.ilike('title', `%${searchParams.q}%`)
      }
      const { data: movies, error } = await query
      if (error) {
        setMovies([])
      } else {
        setMovies(movies || [])
      }
      setLoading(false)
    }
    fetchMovies()
  }, [supabase, searchParams.genre, searchParams.q])

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

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movies/${movie.id}`}
              className="group relative overflow-visible rounded-lg bg-white shadow-md transition-transform hover:scale-105 dark:bg-gray-800"
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
                <div
                  className="relative group"
                  onMouseEnter={e => {
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    setTooltip({
                      visible: true,
                      content: movie.description,
                      x: rect.left + rect.width / 2,
                      y: rect.top - 12
                    });
                  }}
                  onMouseLeave={() => setTooltip(t => ({...t, visible: false}))}
                >
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 cursor-pointer">{movie.description}</p>
                </div>
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
        <Tooltip visible={tooltip.visible} content={tooltip.content} x={tooltip.x} y={tooltip.y} dark={isDark} />
        </>
      )}
    </div>
  )
} 