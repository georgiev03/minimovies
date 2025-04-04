'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useWatchHistory } from '@/lib/hooks/useWatchHistory'
import ReviewModal from '@/components/review/ReviewModal'
import { useRouter } from 'next/navigation'

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
  review: string
  created_at: string
  profile: {
    full_name: string
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
  const router = useRouter()

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(`/movies/${params.id}`))
    }
  }, [user, router, params.id])

  // Add to watch history when video starts playing
  const handleMessage = (event: MessageEvent) => {
    if (!event.origin.includes('youtube.com')) return;
    
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      
      // Log all YouTube events for debugging
      console.log('YouTube event:', data);

      // Handle different YouTube player states
      if (data.event === "onStateChange") {
        // State 1 = playing
        if (data.info === 1 && !hasStartedWatching && user) {
          console.log('Video started playing, adding to watch history');
          setHasStartedWatching(true);
          addToHistory(params.id, 0).then(() => {
            console.log('Added to watch history successfully');
          }).catch(err => {
            console.error('Error adding to watch history:', err);
          });
        }
      }
    } catch (err) {
      console.error('Error handling YouTube message:', err);
    }
  };

  useEffect(() => {
    // Add event listener for YouTube player messages
    window.addEventListener('message', handleMessage);
    
    // Initialize YouTube player
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Declare global YouTube player variable
    (window as any).onYouTubeIframeAPIReady = () => {
      console.log('YouTube API ready');
    };

    return () => {
      window.removeEventListener('message', handleMessage);
      delete (window as any).onYouTubeIframeAPIReady;
    };
  }, [params.id, user, hasStartedWatching, addToHistory]);

  // Reset watch state when movie changes
  useEffect(() => {
    setHasStartedWatching(false);
  }, [params.id]);

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
            id, 
            user_id, 
            movie_id, 
            rating, 
            review,
            created_at
          `)
          .eq('movie_id', params.id)
          .order('created_at', { ascending: false })

        if (reviewsError) throw reviewsError
        
        // After getting reviews, fetch profiles separately to get full names
        const userIds = reviewsData?.map(review => review.user_id) || []
        
        // Get profile data for users who left reviews
        let userProfiles: Record<string, string> = {}
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds)
            
          if (profilesData) {
            // Create a mapping of user_id to full_name
            userProfiles = profilesData.reduce((acc: Record<string, string>, profile: any) => {
              if (profile.id && profile.full_name) {
                acc[profile.id] = profile.full_name
              }
              return acc
            }, {})
          }
        }
        
        // Map the data to match our Review interface
        const formattedReviews = reviewsData?.map(review => {
          return {
            id: review.id,
            user_id: review.user_id,
            movie_id: review.movie_id,
            rating: review.rating,
            review: review.review,
            created_at: review.created_at,
            profile: {
              full_name: userProfiles[review.user_id] || `User ${review.user_id.substring(0, 6)}`
            }
          };
        }) || []
        
        console.log('Formatted reviews:', JSON.stringify(formattedReviews, null, 2))
        formattedReviews.forEach((review, index) => {
          console.log(`Review ${index + 1} review:`, review.review)
        })
        
        setReviews(formattedReviews)
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
      <div className="mb-8">
        <div className="relative pb-[56.25%] bg-black">
          {movie?.video_url && (
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeVideoId(movie.video_url)}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&modestbranding=1&rel=0&autoplay=0`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              id="youtube-player"
              onLoad={() => {
                console.log('YouTube iframe loaded');
                // Send a message to the iframe to enable API
                const iframe = document.getElementById('youtube-player') as HTMLIFrameElement;
                if (iframe && iframe.contentWindow) {
                  // Send multiple initialization messages to ensure the player is ready
                  const messages = [
                    '{"event":"listening","id":0}',
                    '{"event":"command","func":"addEventListener","args":["onStateChange"]}',
                    '{"event":"command","func":"playVideo","args":""}'
                  ];
                  messages.forEach(msg => {
                    iframe.contentWindow?.postMessage(msg, '*');
                  });
                }
              }}
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
          <div className="flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-6 h-6 ${
                    i < (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length || 0)
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
            <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {reviews.length > 0
                ? `${(reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)} out of 5 (${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'})`
                : 'No reviews yet'}
            </span>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="flex flex-col items-center py-8">
            <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No reviews yet. Be the first to review this movie!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={`p-4 rounded-lg ${
                  isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {review.profile.full_name}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
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
                {review.review ? (
                  <div className={`mt-4 p-4 rounded ${isDark ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
                    <p className={`${isDark ? 'text-white' : 'text-gray-800'} text-base leading-relaxed`}>
                      "{review.review}"
                    </p>
                  </div>
                ) : (
                  <p className={`mt-4 italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    No review provided
                  </p>
                )}
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