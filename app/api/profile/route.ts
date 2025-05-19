import { NextRequest, NextResponse } from 'next/server';
import { updateProfile } from '@/lib/actions';
import { rateLimit } from '@/api-middleware/rateLimits';

export async function PATCH(req: NextRequest) {
  const { limited } = rateLimit(req, { windowMs: 60_000 * 15, max: 4 });
  if (limited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const data = await req.json();
    const result = await updateProfile(data);
    if (result?.error) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('[Profile PATCH] Error:', error.message, error.stack);
    } else {
      console.error('[Profile PATCH] Unknown error:', error);
    }
    return NextResponse.json(
      {
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}

export async function PUT() {
  return NextResponse.json({ success: false, error: 'Method Not Allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ success: false, error: 'Method Not Allowed' }, { status: 405 });
}
