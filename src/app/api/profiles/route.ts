import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ProfileService } from '@/lib/services/profile.service';
import { ProfileRepository } from '@/lib/repositories/profile.repository';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api.utils';
import { handleError } from '@/lib/utils/error.utils';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const profileRepository = new ProfileRepository(supabase);
    const profileService = new ProfileService(profileRepository);

    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');

    let profiles;
    if (username) {
      const profile = await profileService.getProfileByUsername(username);
      profiles = profile ? [profile] : [];
    } else {
      profiles = await profileService.getAllProfiles();
    }

    return NextResponse.json(createSuccessResponse(profiles));
  } catch (error) {
    const appError = handleError(error);
    return NextResponse.json(
      createErrorResponse(appError.message),
      { status: appError.statusCode }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const profileRepository = new ProfileRepository(supabase);
    const profileService = new ProfileService(profileRepository);

    const data = await request.json();
    const profile = await profileService.createProfile(data);

    return NextResponse.json(createSuccessResponse(profile), { status: 201 });
  } catch (error) {
    const appError = handleError(error);
    return NextResponse.json(
      createErrorResponse(appError.message),
      { status: appError.statusCode }
    );
  }
} 