'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MOVIE_GENRES } from '@/lib/constants/genres'

type MovieFormData = {
  title: string
  description: string
  genres: string[]
  video_url: string
  thumbnail_url: string
}

export default function NewMovieForm({
  params,
}: {
  params: { action: string }
}) {
  const router = useRouter()
  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    description: '',
    genres: [],
    video_url: '',
    thumbnail_url: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => {
      const genres = prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
      return { ...prev, genres }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClientComponentClient()

    try {
      // First, insert the movie
      const { data: movie, error: movieError } = await supabase
        .from('movies')
        .insert([{
          title: formData.title,
          description: formData.description,
          video_url: formData.video_url,
          thumbnail_url: formData.thumbnail_url
        }])
        .select()
        .single()
      
      if (movieError) {
        console.error('Error creating movie:', movieError)
        throw movieError
      }

      // Then, get the genre IDs
      const { data: genres, error: genresError } = await supabase
        .from('genres')
        .select('id, name')
        .in('name', formData.genres)

      if (genresError) {
        console.error('Error fetching genres:', genresError)
        throw genresError
      }

      // Finally, create the movie-genre relationships
      const { error: relationError } = await supabase
        .from('movie_genres')
        .insert(
          genres.map(genre => ({
            movie_id: movie.id,
            genre_id: genre.id
          }))
        )

      if (relationError) {
        console.error('Error creating genre relationships:', relationError)
        throw relationError
      }
      
      router.push('/admin/movies')
      router.refresh()
    } catch (err) {
      console.error('Error creating movie:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Add New Movie
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="block w-full rounded-md bg-gray-100 border-transparent px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500"
            placeholder="Enter movie title"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="block w-full rounded-md bg-gray-100 border-transparent px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500"
            placeholder="Enter movie description"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Genres
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {MOVIE_GENRES.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => handleGenreToggle(genre)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                  formData.genres.includes(genre)
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
          {formData.genres.length === 0 && (
            <p className="mt-1 text-sm text-red-500">Please select at least one genre</p>
          )}
        </div>

        <div>
          <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-1">
            Video URL
          </label>
          <input
            type="url"
            id="video_url"
            value={formData.video_url}
            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
            className="block w-full rounded-md bg-gray-100 border-transparent px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500"
            placeholder="Enter video URL"
            required
          />
        </div>

        <div>
          <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-700 mb-1">
            Thumbnail URL
          </label>
          <input
            type="url"
            id="thumbnail_url"
            value={formData.thumbnail_url}
            onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
            className="block w-full rounded-md bg-gray-100 border-transparent px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500"
            placeholder="Enter thumbnail URL"
            required
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/admin/movies')}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || formData.genres.length === 0}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
} 