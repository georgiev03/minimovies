-- Create watch_history table
CREATE TABLE IF NOT EXISTS watch_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  progress_seconds INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, movie_id)
);

-- Add RLS policies
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own watch history
CREATE POLICY "Users can view their own watch history"
  ON watch_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert/update their own watch history
CREATE POLICY "Users can insert their own watch history"
  ON watch_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch history"
  ON watch_history
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX watch_history_user_id_idx ON watch_history(user_id);
CREATE INDEX watch_history_movie_id_idx ON watch_history(movie_id);
CREATE INDEX watch_history_watched_at_idx ON watch_history(watched_at DESC); 