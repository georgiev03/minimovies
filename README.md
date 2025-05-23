# Mini Movies

A web-based movie application built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- User authentication (sign up, sign in, sign out)
- Movie browsing with genre filtering and dynamic search
- Video playback
- Admin dashboard for managing movies
- Role-based access control
- User profiles with watch history
- Personalized movie recommendations
- Responsive design for mobile and desktop

## Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Supabase account and project

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── movies/            # Movie pages
│   ├── profile/           # User profile pages
│   └── login/             # Authentication pages
├── components/            # React components
├── lib/                   # Utility functions and configurations
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── interfaces/       # TypeScript interfaces
│   ├── repositories/     # Database repositories
│   ├── services/         # Business logic services
│   └── utils/            # Utility functions
└── styles/               # Global styles
```

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/minimovies.git
   cd minimovies
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with your Supabase configuration:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up your Supabase database:
   - Create a new project in Supabase
   - Create the following tables:
     - `profiles` (extends Supabase auth.users)
     - `movies`
     - `genres`
     - `movie_genres`
     - `watch_history`
   - Set up Row Level Security (RLS) policies
   - Enable email authentication

5. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### profiles
- id (uuid, primary key, references auth.users)
- email (text)
- full_name (text)
- avatar_url (text, nullable)
- role (text, enum: 'user', 'admin')
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)

### movies
- id (uuid, primary key)
- title (text)
- description (text)
- video_url (text)
- thumbnail_url (text)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)

### genres
- id (uuid, primary key)
- name (text, unique)
- created_at (timestamp with time zone)

### movie_genres
- movie_id (uuid, references movies.id)
- genre_id (uuid, references genres.id)
- created_at (timestamp with time zone)
- Primary key: (movie_id, genre_id)

### watch_history
- id (uuid, primary key)
- user_id (uuid, references profiles.id)
- movie_id (uuid, references movies.id)
- watched_at (timestamp with time zone)

## RLS Policies

### profiles
```sql
CREATE POLICY "Users can view their own data" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### movies
```sql
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
```

### genres
```sql
CREATE POLICY "Anyone can view genres" ON genres
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage genres" ON genres
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

### movie_genres
```sql
CREATE POLICY "Anyone can view movie genres" ON movie_genres
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage movie genres" ON movie_genres
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

### watch_history
```sql
CREATE POLICY "Users can view their own watch history" ON watch_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watch history" ON watch_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watch history" ON watch_history
  FOR DELETE USING (auth.uid() = user_id);
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 