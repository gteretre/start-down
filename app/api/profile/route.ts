import { NextRequest, NextResponse } from 'next/server';
import { updateProfile } from '@/lib/actions';

export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();
    const result = await updateProfile(data);
    if (result?.error) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
