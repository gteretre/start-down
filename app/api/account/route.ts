import { NextRequest, NextResponse } from 'next/server';
import { deleteProfile, updateAccount } from '@/lib/actions';
import { rateLimit } from '@/api-middleware/rateLimits';
import { auth } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
  const { limited } = rateLimit(req, { windowMs: 60_000 * 15, max: 4 });
  if (limited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  const session = await auth();
  if (!session || !session.user || !session.user.username) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const result = await deleteProfile();
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.set('authjs.session-token', '', { maxAge: 0, path: '/' });
  return response;
}

export async function PATCH(req: NextRequest) {
  const { limited } = rateLimit(req, { windowMs: 60_000 * 15, max: 4 });
  if (limited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  const session = await auth();
  if (!session || !session.user || !session.user.username) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  try {
    const data = await req.json();
    const result = await updateAccount({ language: data.language });
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('[Account PATCH] Error:', error.message, error.stack);
    } else {
      console.error('[Account PATCH] Unknown error:', error);
    }
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}
