import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function createStoredProcedures() {
  try {
    // Create stored procedure for profiles table
    const { error: profilesError } = await supabase.rpc('create_profiles_table_procedure', {
      sql: `
        CREATE OR REPLACE FUNCTION create_profiles_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID REFERENCES auth.users(id) PRIMARY KEY,
            email TEXT NOT NULL,
            full_name TEXT NOT NULL,
            avatar_url TEXT,
            role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
          );

          -- Enable RLS
          ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

          -- Create RLS policies
          CREATE POLICY "Users can view their own data" ON profiles
            FOR SELECT USING (auth.uid() = id);

          CREATE POLICY "Users can update their own data" ON profiles
            FOR UPDATE USING (auth.uid() = id);

          -- Create updated_at trigger
          CREATE OR REPLACE FUNCTION public.handle_updated_at()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = TIMEZONE('utc'::text, NOW());
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;

          CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON public.profiles
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
        END;
        $$ LANGUAGE plpgsql;
      `
    })

    if (profilesError) {
      console.error('Error creating profiles table procedure:', profilesError)
      return
    }

    // Create stored procedure for movies table
    const { error: moviesError } = await supabase.rpc('create_movies_table_procedure', {
      sql: `
        CREATE OR REPLACE FUNCTION create_movies_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS public.movies (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            genre TEXT NOT NULL,
            video_url TEXT NOT NULL,
            thumbnail_url TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
          );

          -- Enable RLS
          ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

          -- Create RLS policies
          CREATE POLICY "Anyone can view movies" ON movies
            FOR SELECT USING (true);

          CREATE POLICY "Only admins can insert movies" ON movies
            FOR INSERT WITH CHECK (
              EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
              )
            );

          CREATE POLICY "Only admins can update movies" ON movies
            FOR UPDATE USING (
              EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
              )
            );

          CREATE POLICY "Only admins can delete movies" ON movies
            FOR DELETE USING (
              EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
              )
            );

          -- Create updated_at trigger
          CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON public.movies
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
        END;
        $$ LANGUAGE plpgsql;
      `
    })

    if (moviesError) {
      console.error('Error creating movies table procedure:', moviesError)
      return
    }

    // Create stored procedure for watch_history table
    const { error: watchHistoryError } = await supabase.rpc('create_watch_history_table_procedure', {
      sql: `
        CREATE OR REPLACE FUNCTION create_watch_history_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS public.watch_history (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES public.profiles(id) NOT NULL,
            movie_id UUID REFERENCES public.movies(id) NOT NULL,
            watched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
          );

          -- Enable RLS
          ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

          -- Create RLS policies
          CREATE POLICY "Users can view their own watch history" ON watch_history
            FOR SELECT USING (auth.uid() = user_id);

          CREATE POLICY "Users can insert their own watch history" ON watch_history
            FOR INSERT WITH CHECK (auth.uid() = user_id);

          CREATE POLICY "Users can delete their own watch history" ON watch_history
            FOR DELETE USING (auth.uid() = user_id);
        END;
        $$ LANGUAGE plpgsql;
      `
    })

    if (watchHistoryError) {
      console.error('Error creating watch_history table procedure:', watchHistoryError)
      return
    }

    console.log('Stored procedures created successfully!')
  } catch (error) {
    console.error('Error creating stored procedures:', error)
  }
} 