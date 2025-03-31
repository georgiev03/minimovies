import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createAdminUser() {
  try {
    // Register the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@gmail.com',
      password: 'admin123',
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: {
          full_name: 'Admin',
        }
      }
    })

    if (signUpError) {
      console.error('Error signing up:', signUpError.message)
      return
    }

    if (!authData.user) {
      console.error('No user data returned')
      return
    }

    // Create the user profile with admin role
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email: 'admin@gmail.com',
          full_name: 'Admin',
          role: 'admin',
        },
      ])

    if (profileError) {
      console.error('Error creating profile:', profileError.message)
      return
    }

    console.log('Admin user created successfully!')
  } catch (error) {
    console.error('Error:', error)
  }
}

createAdminUser() 