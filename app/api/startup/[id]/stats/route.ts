import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { rateLimit } from '@/api-middleware/rateLimits';
import { getStartupStats } from '@/lib/queries';
import { updateStartupViews } from '@/lib/mutations';
import { hasViewedInWindow } from '@/lib/actions';
import { upsertViewTimestamp } from '@/lib/mutations';

const cache = new Map<string, { views: number; likes: number; ts: number }>();
const CACHE_TTL = 10_000;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { limited } = rateLimit(req, { windowMs: 60_000, max: 30 });
  if (limited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  const id = (await params).id;
  if (!id) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  try {
    if (cache.has(id)) {
      const cached = cache.get(id)!;
      if (Date.now() - cached.ts < CACHE_TTL) {
        return NextResponse.json({ views: cached.views, likes: cached.likes });
      }
    }
    const { views, likes } = await getStartupStats(id);
    cache.set(id, { views, likes, ts: Date.now() });
    return NextResponse.json({ views, likes });
  } catch (error) {
    if (error instanceof Error) {
      console.error('[Startup Stats GET] Error:', error.message, error.stack);
    } else {
      console.error('[Startup Stats GET] Unknown error:', error);
    }
    return NextResponse.json(
      {
        error: 'Failed to fetch stats: ' + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { limited } = rateLimit(req, { windowMs: 60_000 * 30, max: 4 });
  if (limited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  const id = (await params).id;
  if (!id) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const session = await auth();
  if (!session?.user?.username) {
    return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });
  }

  const VIEW_WINDOW = 24 * 60 * 60 * 1000;
  const alreadyViewed = await hasViewedInWindow(id, session.user.username, VIEW_WINDOW);
  if (alreadyViewed === null) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }
  if (alreadyViewed) {
    return NextResponse.json(
      { error: 'View already counted in the last 24 hours' },
      { status: 429 }
    );
  }

  try {
    await updateStartupViews(id);
    await upsertViewTimestamp(id, session.user.username);
    const { views, likes } = await getStartupStats(id);
    cache.set(id, { views, likes, ts: Date.now() });
    return NextResponse.json({ views, likes });
  } catch (error) {
    if (error instanceof Error) {
      console.error('[Startup Stats POST] Error:', error.message, error.stack);
    } else {
      console.error('[Startup Stats POST] Unknown error:', error);
    }
    return NextResponse.json(
      {
        error:
          'Failed to update stats: ' + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
