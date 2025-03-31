import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type MovieGenre = {
  genres: {
    name: string
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getFeaturedMovies() {
  const { data: movies, error } = await supabase
    .from('movies')
    .select(`
      *,
      movie_genres (
        genres (
          name
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching featured movies:', error)
    return []
  }

  console.log('Featured movies:', movies)
  return movies
}

export default async function HomePage() {
  const featuredMovies = await getFeaturedMovies()
  console.log('Featured movies in HomePage:', featuredMovies)

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Movies</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-[1400px] mx-auto">
          {featuredMovies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movies/${movie.id}`}
              className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:scale-105 w-full"
            >
              <div className="relative pb-[150%]">
                <img
                  src={movie.thumbnail_url}
                  alt={movie.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{movie.title}</h3>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">{movie.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {movie.movie_genres.map((mg: MovieGenre) => (
                    <span
                      key={mg.genres.name}
                      className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700"
                    >
                      {mg.genres.name}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
} 