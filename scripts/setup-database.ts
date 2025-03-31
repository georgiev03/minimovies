import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function setupDatabase() {
  try {
    // Execute stored procedures to create tables
    const { error: profilesError } = await supabase.rpc('create_profiles_table')
    if (profilesError) {
      console.error('Error creating profiles table:', profilesError)
      return
    }

    const { error: moviesError } = await supabase.rpc('create_movies_table')
    if (moviesError) {
      console.error('Error creating movies table:', moviesError)
      return
    }

    const { error: watchHistoryError } = await supabase.rpc('create_watch_history_table')
    if (watchHistoryError) {
      console.error('Error creating watch_history table:', watchHistoryError)
      return
    }

    console.log('Database setup completed successfully!')
  } catch (error) {
    console.error('Error setting up database:', error)
  }
}

setupDatabase() 