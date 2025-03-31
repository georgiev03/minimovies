'use client'

import { useWatchHistory } from '@/lib/hooks/useWatchHistory'
import Link from 'next/link'

export default function WatchHistoryPage() {
  const { history, loading } = useWatchHistory()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Watch History</h1>
      </div>

      {history.length === 0 ? (
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
          {history.map((entry) => (
            <Link
              key={entry.id}
              href={`/movies/${entry.movie_id}`}
              className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative pb-[56.25%]">
                <img
                  src={entry.movie.thumbnail_url}
                  alt={entry.movie.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900">{entry.movie.title}</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {entry.movie.movie_genres?.map((mg) => (
                    <span
                      key={mg.genres.name}
                      className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700"
                    >
                      {mg.genres.name}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Watched: {new Date(entry.watched_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 