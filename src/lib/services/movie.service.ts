import { MovieRepository } from '../repositories/movie.repository';
import { Movie, CreateMovieDTO, UpdateMovieDTO } from '../interfaces/movie.interface';

export class MovieService {
  constructor(private movieRepository: MovieRepository) {}

  async getAllMovies(): Promise<Movie[]> {
    return this.movieRepository.findAll();
  }

  async getMovieById(id: string): Promise<Movie | null> {
    return this.movieRepository.findById(id);
  }

  async searchMoviesByTitle(title: string): Promise<Movie[]> {
    return this.movieRepository.findByTitle(title);
  }

  async getMoviesByGenre(genre: string): Promise<Movie[]> {
    return this.movieRepository.findByGenre(genre);
  }

  async createMovie(data: CreateMovieDTO): Promise<Movie> {
    return this.movieRepository.createMovie(data);
  }

  async updateMovie(id: string, data: UpdateMovieDTO): Promise<Movie> {
    return this.movieRepository.updateMovie(id, data);
  }

  async deleteMovie(id: string): Promise<void> {
    return this.movieRepository.delete(id);
  }
} 