import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base.repository';
import { Profile, CreateProfileDTO, UpdateProfileDTO } from '../interfaces/profile.interface';

export class ProfileRepository extends BaseRepository<Profile> {
  constructor(db: SupabaseClient) {
    super(db, 'profiles');
  }

  async findByUsername(username: string): Promise<Profile | null> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) throw error;
    return data as Profile | null;
  }

  async createProfile(data: CreateProfileDTO): Promise<Profile> {
    return this.create(data);
  }

  async updateProfile(id: string, data: UpdateProfileDTO): Promise<Profile> {
    return this.update(id, data);
  }
} 