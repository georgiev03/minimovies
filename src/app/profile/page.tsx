import React from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface MovieGenre {
  genres: {
    name: string
  }
}

interface WatchHistoryMovie {
  id: string
  title: string
  thumbnail_url: string
  description: string
  movie_genres: MovieGenre[]
}

interface WatchHistoryEntry {
  id: string
  watched_at: string
  progress_seconds: number
  movies: WatchHistoryMovie
}

async function getUser() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user
}

async function getWatchHistory(userId: string): Promise<WatchHistoryEntry[]> {
  const supabase = createServerComponentClient({ cookies })
  const { data: history, error } = await supabase
    .from('watch_history')
    .select(`
      *,
      movies (
        id,
        title,
        thumbnail_url,
        description,
        movie_genres (
          genres (
            name
          )
        )
      )
    `)
    .eq('user_id', userId)
    .order('watched_at', { ascending: false })

  if (error) {
    console.error('Error fetching watch history:', error)
    return []
  }

  return history
}

export default async function WatchHistoryPage() {
  const user = await getUser()
  
  if (!user) {
    notFound()
  }

  const watchHistory = await getWatchHistory(user.id)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Watch History</h1>
      </div>

      {watchHistory.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No watch history yet</h3>
          <p className="mt-2 text-gray-500">
            Start watching movies to build your history
          </p>
          <Link
            href="/movies"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {watchHistory.map((item) => (
            <Link
              key={item.id}
              href={`/movies/${item.movies.id}`}
              className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:scale-105"
            >
              <div className="relative pb-[150%]">
                <img
                  src={item.movies.thumbnail_url}
                  alt={item.movies.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <h3 className="text-lg font-semibold text-gray-900">{item.movies.title}</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.movies.movie_genres.map((mg: MovieGenre) => (
                    <span
                      key={mg.genres.name}
                      className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700"
                    >
                      {mg.genres.name}
                    </span>
                  ))}
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-500">
                    Watched {new Date(item.watched_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Progress: {Math.floor(item.progress_seconds / 60)}m {item.progress_seconds % 60}s
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 