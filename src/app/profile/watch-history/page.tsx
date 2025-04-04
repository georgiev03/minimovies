'use client'

import { useWatchHistory } from '@/lib/hooks/useWatchHistory'
import { useState } from 'react'
import Link from 'next/link'
import ReviewModal from '@/components/review/ReviewModal'
import { useTheme } from '@/lib/contexts/ThemeContext'

export default function WatchHistoryPage() {
  const { history, loading, error } = useWatchHistory()
  const [selectedMovie, setSelectedMovie] = useState<{ id: string; title: string } | null>(null)
  const { isDark } = useTheme()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${isDark ? 'border-indigo-400' : 'border-indigo-600'}`}></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Error loading watch history</h3>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {error}
        </p>
        <Link
          href="/movies"
          className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
            isDark ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          Browse Movies
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Watch History</h1>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>No watch history yet</h3>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Start watching movies to build your history
          </p>
          <Link
            href="/movies"
            className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              isDark ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {history.map((entry) => (
            <div
              key={entry.id}
              className={`group relative ${
                isDark ? 'bg-gray-800' : 'bg-gray-50'
              } rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col`}
            >
              <div className="relative pb-[150%]">
                <img
                  src={entry.movie.thumbnail_url}
                  alt={entry.movie.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <button
                    onClick={() => setSelectedMovie({ id: entry.movie_id, title: entry.movie.title })}
                    className={`opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-200 px-4 py-2 ${
                      isDark ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                    } text-white rounded-md`}
                  >
                    Leave a Review
                  </button>
                </div>
              </div>
              <div className={`p-4 flex-1 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {entry.movie.title}
                </h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {entry.movie.movie_genres?.map((mg) => (
                    <span
                      key={mg.genres.name}
                      className={`inline-flex items-center rounded-full ${
                        isDark ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                      } px-2 py-0.5 text-xs font-medium`}
                    >
                      {mg.genres.name}
                    </span>
                  ))}
                </div>
                <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Watched: {new Date(entry.watched_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <ReviewModal
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
        movie={selectedMovie || { id: '', title: '' }}
      />
    </div>
  )
} 