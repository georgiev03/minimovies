-- Create watch_history table
CREATE TABLE IF NOT EXISTS watch_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  progress_seconds INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, movie_id)
);