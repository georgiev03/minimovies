export interface Movie {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  genre: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMovieDTO {
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  genre: string;
}

export interface UpdateMovieDTO {
  title?: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  genre?: string;
} 