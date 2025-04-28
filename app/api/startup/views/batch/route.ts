import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Simple in-memory cache for batch views
const cache = new Map<string, { views: number; ts: number }>();
const CACHE_TTL = 60 * 1000;

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const { ids } = (await request.json()) as { ids?: string[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty IDs array' }, { status: 400 });
    }

    const now = Date.now();
    const objectIds: ObjectId[] = [];
    const cachedViews: { [key: string]: number } = {};
    const idsToFetch: string[] = [];

    for (const id of ids) {
      const cached = cache.get(id);
      if (cached && now - cached.ts < CACHE_TTL) {
        cachedViews[id] = cached.views;
      } else {
        idsToFetch.push(id);
        try {
          objectIds.push(new ObjectId(id));
        } catch (error) {
          console.warn(`Invalid ObjectId format: ${id}: ${error}`);
        }
      }
    }

    const viewsMap: { [key: string]: number } = { ...cachedViews };

    if (objectIds.length > 0) {
      const startups = await db
        .collection('startups')
        .find({ _id: { $in: objectIds } })
        .project({ _id: 1, views: 1 })
        .toArray();

      startups.forEach((startup) => {
        const id = startup._id.toString();
        const views = typeof startup.views === 'number' ? startup.views : 0;
        viewsMap[id] = views;
        cache.set(id, { views, ts: now });
      });
    }

    return NextResponse.json({ views: viewsMap });
  } catch (error) {
    console.error('Error fetching batch views:', error);
    return NextResponse.json(
      { error: 'Internal Server Error fetching batch views' },
      { status: 500 }
    );
  }
}
