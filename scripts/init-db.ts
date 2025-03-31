import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { createStoredProcedures } from './create-stored-procedures.js'
import { setupDatabase } from './setup-database.js'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function initDatabase() {
  try {
    console.log('Creating stored procedures...')
    await createStoredProcedures()
    
    console.log('Setting up database...')
    await setupDatabase()
    
    console.log('Database initialization completed successfully!')
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}

initDatabase() 