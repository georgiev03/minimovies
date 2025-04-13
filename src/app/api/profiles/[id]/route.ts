import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ProfileService } from '@/lib/services/profile.service';
import { ProfileRepository } from '@/lib/repositories/profile.repository';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api.utils';
import { handleError } from '@/lib/utils/error.utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const profileRepository = new ProfileRepository(supabase);
    const profileService = new ProfileService(profileRepository);

    const profile = await profileService.getProfileById(params.id);
    if (!profile) {
      return NextResponse.json(
        createErrorResponse('Profile not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(createSuccessResponse(profile));
  } catch (error) {
    const appError = handleError(error);
    return NextResponse.json(
      createErrorResponse(appError.message),
      { status: appError.statusCode }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const profileRepository = new ProfileRepository(supabase);
    const profileService = new ProfileService(profileRepository);

    const data = await request.json();
    const profile = await profileService.updateProfile(params.id, data);

    return NextResponse.json(createSuccessResponse(profile));
  } catch (error) {
    const appError = handleError(error);
    return NextResponse.json(
      createErrorResponse(appError.message),
      { status: appError.statusCode }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const profileRepository = new ProfileRepository(supabase);
    const profileService = new ProfileService(profileRepository);

    await profileService.deleteProfile(params.id);

    return NextResponse.json(createSuccessResponse(null), { status: 204 });
  } catch (error) {
    const appError = handleError(error);
    return NextResponse.json(
      createErrorResponse(appError.message),
      { status: appError.statusCode }
    );
  }
} 