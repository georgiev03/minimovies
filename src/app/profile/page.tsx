'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/lib/contexts/ThemeContext'

interface Profile {
  id: string
  full_name: string
  created_at: string
  updated_at: string
  avatar_url?: string
  role?: string
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const { isDark } = useTheme()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login?redirect=/profile')
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (error) throw error
        setProfile(data)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to load profile. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProfile()
  }, [user, supabase])

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
          isDark ? 'border-indigo-400' : 'border-indigo-600'
        }`}></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Error Loading Profile
          </h2>
          <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
          <button
            onClick={() => router.refresh()}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Should never happen due to redirect in useEffect
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}>
        <div className={`px-6 py-8 ${isDark ? 'bg-indigo-900' : 'bg-indigo-500'}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`h-24 w-24 rounded-full border-4 ${isDark ? 'border-indigo-700 bg-indigo-800' : 'border-indigo-300 bg-indigo-200'} flex items-center justify-center text-3xl font-bold text-white`}>
                {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
              </div>
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-white">
                {profile?.full_name || user.email?.split('@')[0] || 'User'}
              </h1>
              <p className="text-indigo-100">
                {user.email}
              </p>
              <p className="text-sm text-indigo-200 mt-1">
                Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'recently'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Your Movie Dashboard
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/profile/watch-history"
              className={`block p-6 rounded-lg border ${
                isDark 
                  ? 'border-gray-700 bg-gray-700 hover:bg-gray-600' 
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              } transition-colors duration-200`}
            >
              <div className="flex items-center">
                <div className={`rounded-full p-3 ${
                  isDark ? 'bg-indigo-800' : 'bg-indigo-100'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${
                    isDark ? 'text-indigo-300' : 'text-indigo-600'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Watch History
                  </h3>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-500'}>
                    View all the movies you've watched
                  </p>
                </div>
                <div className="ml-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Link>
            
            <Link
              href="/movies"
              className={`block p-6 rounded-lg border ${
                isDark 
                  ? 'border-gray-700 bg-gray-700 hover:bg-gray-600' 
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              } transition-colors duration-200`}
            >
              <div className="flex items-center">
                <div className={`rounded-full p-3 ${
                  isDark ? 'bg-indigo-800' : 'bg-indigo-100'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${
                    isDark ? 'text-indigo-300' : 'text-indigo-600'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Browse Movies
                  </h3>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-500'}>
                    Discover new movies to watch
                  </p>
                </div>
                <div className="ml-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 