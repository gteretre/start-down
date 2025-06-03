import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/api-middleware/rateLimits';
import { upvoteComment } from '@/lib/actions';

import { auth } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { limited } = rateLimit(req, { windowMs: 60_000 * 2, max: 20 });
  if (limited) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
  }
  const commentId = (await params).id;
  if (!commentId) {
    return NextResponse.json({ success: false, error: 'Missing comment id.' }, { status: 400 });
  }
  const session = await auth();
  if (!session || !session.user || !session.user.username) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  try {
    const result = await upvoteComment(commentId);
    if (result.success) {
      return NextResponse.json({ success: true, toggled: result.toggled ?? true });
    } else {
      if (result.error === 'You must be signed in to upvote.') {
        return NextResponse.json({ success: false, error: result.error }, { status: 401 });
      }
      if (result.error === 'User not found.' || result.error === 'Comment not found.') {
        return NextResponse.json({ success: false, error: result.error }, { status: 404 });
      }
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to update upvote.' },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to upvote/downvote comment.' },
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
