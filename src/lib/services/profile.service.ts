import { ProfileRepository } from '../repositories/profile.repository';
import { Profile, CreateProfileDTO, UpdateProfileDTO } from '../interfaces/profile.interface';

export class ProfileService {
  constructor(private profileRepository: ProfileRepository) {}

  async getAllProfiles(): Promise<Profile[]> {
    return this.profileRepository.findAll();
  }

  async getProfileById(id: string): Promise<Profile | null> {
    return this.profileRepository.findById(id);
  }

  async getProfileByUsername(username: string): Promise<Profile | null> {
    return this.profileRepository.findByUsername(username);
  }

  async createProfile(data: CreateProfileDTO): Promise<Profile> {
    return this.profileRepository.createProfile(data);
  }

  async updateProfile(id: string, data: UpdateProfileDTO): Promise<Profile> {
    return this.profileRepository.updateProfile(id, data);
  }

  async deleteProfile(id: string): Promise<void> {
    return this.profileRepository.delete(id);
  }
} 