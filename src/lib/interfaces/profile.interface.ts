export type Role = 'admin' | 'user';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileDTO {
  username: string;
  avatar_url?: string;
  role?: Role;
}

export interface UpdateProfileDTO {
  username?: string;
  avatar_url?: string;
  role?: Role;
} 