import React from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import EditMovieForm from './EditMovieForm'
import { redirect } from 'next/navigation'

export default async function EditMoviePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient({ cookies })
  
  // Check authentication and admin role
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Fetch the movie data
  const { data: movie, error } = await supabase
    .from('movies')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) {
    console.error('Error fetching movie:', error)
    return <div>Error loading movie</div>
  }

  if (!movie) {
    return <div>Movie not found</div>
  }

  return <EditMovieForm movie={movie} />
} 