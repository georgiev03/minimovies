'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/contexts/AuthContext'
import { useTheme } from '../../lib/contexts/ThemeContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FilmIcon, UserIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'

// Create Supabase client outside component to prevent recreation on every render
const supabase = createClientComponentClient()

export default function Navbar() {
  const router = useRouter()
  const { user, signOut, loading } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [isAdmin, setIsAdmin] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function fetchUserRole() {
      try {
        if (!user) {
          setIsAdmin(false)
          return
        }
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        setIsAdmin(profile?.role === 'admin')
      } catch (error) {
        console.error('Error fetching user role:', error)
        setIsAdmin(false)
      }
    }

    if (mounted) {
      fetchUserRole()
    }
  }, [user, mounted])

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null // or a loading skeleton
  }

  return (
    <nav className="bg-white shadow dark:bg-gray-800 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                MiniMovies
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href={isAdmin ? "/admin/movies" : "/movies"}
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <FilmIcon className="h-5 w-5 mr-1" />
                Movies
              </Link>
              {user && (
                <Link
                  href="/profile/watch-history"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  <UserIcon className="h-5 w-5 mr-1" />
                  Watch History
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
            >
              {isDark ? (
                <SunIcon className="h-6 w-6" />
              ) : (
                <MoonIcon className="h-6 w-6" />
              )}
            </button>
            
            {loading ? (
              <div className="h-6 w-6 rounded-full border-2 border-t-indigo-500 animate-spin"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {displayName}
                </span>
                <button
                  onClick={handleSignOut}
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-600"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 