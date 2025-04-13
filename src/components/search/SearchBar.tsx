'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useDebounce } from '@/lib/hooks/useDebounce'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery.trim()) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('q', debouncedQuery.trim())
      router.push(`/movies?${params.toString()}`)
    } else if (searchParams.get('q')) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('q')
      router.push(`/movies?${params.toString()}`)
    }
  }, [debouncedQuery, router, searchParams])

  return (
    <div className="w-full max-w-xs">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies..."
          className="w-full rounded-lg bg-gray-100 border-transparent pl-8 pr-3 py-1.5 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:bg-gray-600"
        />
        <MagnifyingGlassIcon className="absolute left-2.5 top-2 h-4 w-4 text-gray-400 dark:text-gray-500" />
      </div>
    </div>
  )
} 