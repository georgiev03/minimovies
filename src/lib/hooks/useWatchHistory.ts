import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/lib/contexts/AuthContext'
import type { User } from '@supabase/supabase-js'

export type WatchHistoryEntry = {
  id: string
  user_id: string
  movie_id: string
  watched_at: string
  progress_seconds: number
  movie: {
    title: string
    thumbnail_url: string
    movie_genres: {
      genres: {
        name: string
      }
    }[]
  }
}

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!user) {
      setHistory([])
      setLoading(false)
      return
    }

    async function fetchWatchHistory(currentUser: User) {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('watch_history')
          .select(`
            *,
            movie:movies (
              title,
              thumbnail_url,
              movie_genres (
                genres (
                  name
                )
              )
            )
          `)
          .eq('user_id', currentUser.id)
          .order('watched_at', { ascending: false })

        if (error) {
          throw error
        }

        setHistory(data || [])
      } catch (err) {
        console.error('Error fetching watch history:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch watch history')
      } finally {
        setLoading(false)
      }
    }

    fetchWatchHistory(user)
  }, [user, supabase])

  const addToHistory = async (movieId: string, progressSeconds: number) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('watch_history')
        .upsert({
          user_id: user.id,
          movie_id: movieId,
          watched_at: new Date().toISOString(),
          progress_seconds: progressSeconds
        }, {
          onConflict: 'user_id,movie_id'
        })

      if (error) {
        throw error
      }
    } catch (err) {
      console.error('Error adding to watch history:', err)
    }
  }

  return { history, loading, error, addToHistory }
} 