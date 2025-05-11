'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { useAuth } from '@/lib/contexts/AuthContext'
import Tooltip from './components/Tooltip'

type MovieGenre = {
  genres: {
    name: string
  }
}

interface Movie {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  movie_genres: MovieGenre[]
}

export default function HomePage() {
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const { isDark } = useTheme()
  const { user } = useAuth()

  // Tooltip state
  const [tooltip, setTooltip] = useState<{visible: boolean, content: string, x: number, y: number}>({visible: false, content: '', x: 0, y: 0})

  useEffect(() => {
    async function getFeaturedMovies() {
      try {
        const { data: movies, error } = await supabase
          .from('movies')
          .select(`
            *,
            movie_genres (
              genres (
                name
              )
            )
          `)
          .order('created_at', { ascending: false })
          .limit(6)

        if (error) {
          console.error('Error fetching featured movies:', error)
          return
        }

        setFeaturedMovies(movies || [])
      } catch (err) {
        console.error('Error fetching movies:', err)
      } finally {
        setLoading(false)
      }
    }

    getFeaturedMovies()
  }, [supabase])

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-800 dark:to-purple-900 rounded-2xl overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="mb-8 lg:mb-0">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
                Watch Movies Anytime, Anywhere
              </h1>
              <p className="text-xl text-indigo-100 mb-8">
                Discover a curated collection of films. Keep track of your favorites and share your thoughts with a community of movie lovers.
              </p>
              <div className="flex flex-wrap gap-4">
                {!user && (
                  <Link
                    href="/login"
                    className="inline-flex items-center rounded-md bg-white px-6 py-3 text-base font-medium text-indigo-600 shadow-sm hover:bg-indigo-50"
                  >
                    Sign In
                  </Link>
                )}
                <Link
                  href="/movies"
                  className="inline-flex items-center rounded-md bg-indigo-800 bg-opacity-50 px-6 py-3 text-base font-medium text-white shadow-sm ring-1 ring-white ring-opacity-20 hover:bg-opacity-60"
                >
                  Browse Movies
                </Link>
              </div>
            </div>
            <div className="relative lg:h-[400px] overflow-hidden rounded-lg shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10 opacity-60"></div>
              <img 
                src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1925&q=80" 
                alt="Movie collage" 
                className="object-cover w-full h-full"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.currentTarget.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1925&q=80";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Everything You Need for Your Movie Experience
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Watch Movies</h3>
            <p className="text-gray-600 dark:text-gray-300">Enjoy a variety of films from different genres, all in one place.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Track Watch History</h3>
            <p className="text-gray-600 dark:text-gray-300">Keep track of movies you've watched and easily find them later.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Rate & Review</h3>
            <p className="text-gray-600 dark:text-gray-300">Share your opinions and see what others think about each movie.</p>
          </div>
        </div>
      </section>

      {/* Featured Movies Section */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Movies</h2>
            <Link
              href="/movies"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
                isDark ? 'border-indigo-400' : 'border-indigo-600'
              }`}></div>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {featuredMovies.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movies/${movie.id}`}
                  className="group relative overflow-visible rounded-lg bg-gray-50 dark:bg-gray-800 shadow-md transition-all hover:scale-105 hover:shadow-lg"
                >
                  <div className="relative pb-[150%]">
                    <img
                      src={movie.thumbnail_url}
                      alt={movie.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-sm font-semibold text-white truncate">{movie.title}</h3>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {movie.movie_genres.map((mg: MovieGenre) => (
                          <span
                            key={mg.genres.name}
                            className="inline-flex items-center rounded-full bg-indigo-500 bg-opacity-70 px-2 py-0.5 text-xs font-medium text-white"
                          >
                            {mg.genres.name}
                          </span>
                        ))}
                      </div>
                      <div
                        className="relative group"
                        onMouseEnter={e => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          setTooltip({
                            visible: true,
                            content: movie.description,
                            x: rect.left + rect.width / 2,
                            y: rect.top - 40
                          });
                        }}
                        onMouseLeave={() => setTooltip(t => ({...t, visible: false}))}
                      >
                        <p className="mt-1 text-xs text-gray-300 line-clamp-2 cursor-pointer">
                          {movie.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Tooltip visible={tooltip.visible} content={tooltip.content} x={tooltip.x} y={tooltip.y} />
            </>
          )}
        </div>
      </section>

      {/* CTA Section - Only show when user is not logged in */}
      {!user && (
        <section className="bg-indigo-50 dark:bg-gray-800 rounded-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to start your movie journey?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Sign up today to get access to all features including personalized watch history and the ability to rate and review movies.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              Create an account
            </Link>
          </div>
        </section>
      )}
    </div>
  )
} 