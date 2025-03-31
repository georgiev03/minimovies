'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

type Movie = {
  id: string
  title: string
  genre: string
  created_at: string
  movie_genres: {
    genres: {
      name: string
    }
  }[]
}

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchMovies() {
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

      if (error) {
        console.error('Error fetching movies:', error)
        return
      }

      setMovies(movies || [])
    }

    fetchMovies()
  }, [supabase])

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Error deleting movie:', error)
        return
      }

      // Refresh the movies list
      setMovies(movies.filter(movie => movie.id !== id))
      router.refresh()
    } catch (err) {
      console.error('Error deleting movie:', err)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Movies</h1>
        <Link
          href="/admin/movies/new"
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Add New Movie
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-gray-800 sm:rounded-xl">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead>
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6">
                Title
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Genre
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Created At
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {movies.map((movie) => (
              <tr key={movie.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">
                  {movie.title}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex flex-wrap gap-1">
                    {movie.movie_genres.map((mg) => (
                      <span
                        key={mg.genres.name}
                        className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300"
                      >
                        {mg.genres.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(movie.created_at).toLocaleDateString()}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <Link
                    href={`/admin/movies/edit/${movie.id}`}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(movie.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 