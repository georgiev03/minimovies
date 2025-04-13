import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base.repository';
import { Movie, CreateMovieDTO, UpdateMovieDTO } from '../interfaces/movie.interface';

export class MovieRepository extends BaseRepository<Movie> {
  constructor(db: SupabaseClient) {
    super(db, 'movies');
  }

  async findByTitle(title: string): Promise<Movie[]> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select('*')
      .ilike('title', `%${title}%`);
    
    if (error) throw error;
    return data as Movie[];
  }

  async findByGenre(genre: string): Promise<Movie[]> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select('*')
      .contains('genres', [genre]);
    
    if (error) throw error;
    return data as Movie[];
  }

  async createMovie(data: CreateMovieDTO): Promise<Movie> {
    return this.create(data);
  }

  async updateMovie(id: string, data: UpdateMovieDTO): Promise<Movie> {
    return this.update(id, data);
  }
} 