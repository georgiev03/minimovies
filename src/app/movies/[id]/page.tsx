'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ReactPlayer from 'react-player'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useWatchHistory } from '@/lib/hooks/useWatchHistory'

type Movie = {
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

async function getMovie(id: string) {
  const supabase = createClientComponentClient()
  const { data: movie, error } = await supabase
    .from('movies')
    .select(`
      *,
      movie_genres (
        genres (
          name
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !movie) {
    return null
  }

  return movie
}

export default function MoviePage({
  params,
}: {
  params: { id: string }
}) {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMovie() {
      const movieData = await getMovie(params.id)
      setMovie(movieData)
      setLoading(false)
    }
    loadMovie()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!movie) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
        <MoviePlayer movie={movie} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900">{movie.title}</h1>
        <div className="mt-2 flex flex-wrap gap-1">
          {movie.movie_genres.map((mg) => (
            <span
              key={mg.genres.name}
              className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700"
            >
              {mg.genres.name}
            </span>
          ))}
        </div>
        <p className="mt-4 text-gray-600">{movie.description}</p>
      </div>
    </div>
  )
}

function MoviePlayer({ movie }: { movie: Movie }) {
  const { user } = useAuth()
  const { addToHistory } = useWatchHistory()
  const [progress, setProgress] = useState(0)
  const [lastUpdateTime, setLastUpdateTime] = useState(0)
  const UPDATE_INTERVAL = 10 // Update every 10 seconds

  const handleProgress = ({ playedSeconds }: { playedSeconds: number }) => {
    const currentTime = Math.floor(Date.now() / 1000)
    if (currentTime - lastUpdateTime >= UPDATE_INTERVAL) {
      setProgress(playedSeconds)
      if (user) {
        addToHistory(movie.id, Math.floor(playedSeconds))
      }
      setLastUpdateTime(currentTime)
    }
  }

  return (
    <ReactPlayer
      url={movie.video_url}
      width="100%"
      height="100%"
      controls
      playing
      onProgress={handleProgress}
      className="absolute top-0 left-0"
    />
  )
} 