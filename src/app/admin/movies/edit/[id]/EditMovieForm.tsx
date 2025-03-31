'use client'

import React, { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { MOVIE_GENRES } from '@/lib/constants/genres'

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

type MovieFormData = {
  title: string
  description: string
  genres: string[]
  video_url: string
  thumbnail_url: string
}

export default function EditMovieForm({ movie }: { movie: Movie }) {
  const router = useRouter()
  const [formData, setFormData] = useState<MovieFormData>({
    title: movie.title,
    description: movie.description,
    genres: movie.movie_genres.map(mg => mg.genres.name),
    video_url: movie.video_url,
    thumbnail_url: movie.thumbnail_url,
  })
  const [error, setError] = useState<string | null>(null)

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

    const supabase = createClientComponentClient()
    
    try {
      // First, update the movie details
      const { error: movieError } = await supabase
        .from('movies')
        .update({
          title: formData.title,
          description: formData.description,
          video_url: formData.video_url,
          thumbnail_url: formData.thumbnail_url
        })
        .eq('id', movie.id)

      if (movieError) {
        console.error('Error updating movie:', movieError)
        throw movieError
      }

      // Then, get the genre IDs for the selected genres
      const { data: genres, error: genresError } = await supabase
        .from('genres')
        .select('id, name')
        .in('name', formData.genres)

      if (genresError) {
        console.error('Error fetching genres:', genresError)
        throw genresError
      }

      // Remove existing genre relationships
      const { error: deleteError } = await supabase
        .from('movie_genres')
        .delete()
        .eq('movie_id', movie.id)

      if (deleteError) {
        console.error('Error removing old genres:', deleteError)
        throw deleteError
      }

      // Create new genre relationships
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
    } catch (error) {
      console.error('Error updating movie:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md">{error}</div>
      )}
      
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
          rows={3}
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

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push('/admin/movies')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={formData.genres.length === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
} 