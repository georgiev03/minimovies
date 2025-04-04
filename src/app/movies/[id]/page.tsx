'use client'

import { useEffect, useState, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useWatchHistory } from '@/lib/hooks/useWatchHistory'
import ReviewModal from '@/components/review/ReviewModal'

interface Movie {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  movie_genres: {
    genres: {
      name: string
    }
  }[]
}

interface Review {
  id: string
  user_id: string
  movie_id: string
  rating: number
  comment: string
  created_at: string
  profile: {
    full_name: string
  }
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

function getYouTubeVideoId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function MoviePage({ params }: { params: { id: string } }) {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [hasStartedWatching, setHasStartedWatching] = useState(false)
  const { isDark } = useTheme()
  const { user } = useAuth()
  const { addToHistory } = useWatchHistory()
  const supabase = createClientComponentClient()

  // Handle YouTube player events
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== "https://www.youtube.com") return;
      
      try {
        const data = JSON.parse(event.data);
        if (data.event === "onStateChange" && data.info === 1) { // 1 = playing
          if (!hasStartedWatching && user) {
            setHasStartedWatching(true);
            addToHistory(params.id, 0);
          }
        }
      } catch (err) {
        // Ignore parsing errors from non-player messages
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user, params.id, addToHistory, hasStartedWatching]);

  useEffect(() => {
    async function fetchMovie() {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('movies')
          .select(`
            *,
            movie_genres (
              genres (
                name
              )
            )
          `)
          .eq('id', params.id)
          .single()

        if (error) throw error
        setMovie(data)

        // Fetch reviews with user information
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            *,
            profile:profiles!reviews_user_id_fkey (
              full_name
            )
          `)
          .eq('movie_id', params.id)
          .order('created_at', { ascending: false })

        if (reviewsError) throw reviewsError
        setReviews(reviewsData || [])
      } catch (err) {
        console.error('Error fetching movie:', err)
        setError('Failed to load movie')
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [params.id, supabase])

  const handleVideoProgress = (currentTime: number) => {
    if (user) {
      addToHistory(params.id, Math.floor(currentTime))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${isDark ? 'border-indigo-400' : 'border-indigo-600'}`}></div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="text-center py-12">
        <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {error || 'Movie not found'}
        </h3>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Movie Player Section */}
      <div className="mb-8">
        <div className="relative pb-[56.25%] bg-black">
          {movie?.video_url && (
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeVideoId(movie.video_url)}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&rel=0&modestbranding=1`}
              className="absolute inset-0 w-full h-full"
              title={`Watch ${movie.title}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              sandbox="allow-same-origin allow-scripts allow-popups allow-presentation"
            />
          )}
        </div>
        <div className={`mt-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <h1 className="text-2xl font-bold">{movie.title}</h1>
          <div className="mt-2 flex flex-wrap gap-1">
            {movie.movie_genres?.map((mg) => (
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
          <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {movie.description}
          </p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Reviews
          </h2>
          {user && (
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className={`px-4 py-2 rounded-md text-white ${
                isDark ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              Write a Review
            </button>
          )}
        </div>

        {reviews.length === 0 ? (
          <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No reviews yet. Be the first to review this movie!
          </p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={`p-4 rounded-lg ${
                  isDark ? 'bg-gray-800' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {review.profile.full_name}
                  </h3>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating
                            ? isDark
                              ? 'text-yellow-400'
                              : 'text-yellow-500'
                            : isDark
                            ? 'text-gray-600'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {review.comment}
                </p>
                <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        movie={{ id: movie.id, title: movie.title }}
      />
    </div>
  )
} 