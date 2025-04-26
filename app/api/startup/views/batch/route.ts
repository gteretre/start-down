import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const { ids } = (await request.json()) as { ids?: string[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty IDs array' }, { status: 400 });
    }

    const objectIds = ids
      .map((id) => {
        try {
          return new ObjectId(id);
        } catch (error) {
          console.warn(`Invalid ObjectId format: ${id}: ${error}`);
          return null;
        }
      })
      .filter((id): id is ObjectId => id !== null);

    if (objectIds.length === 0) {
      return NextResponse.json({ views: {} });
    }

    const startups = await db
      .collection('startups')
      .find({ _id: { $in: objectIds } })
      .project({ _id: 1, views: 1 })
      .toArray();

    const viewsMap: { [key: string]: number } = {};
    startups.forEach((startup) => {
      const id = startup._id.toString();
      viewsMap[id] = typeof startup.views === 'number' ? startup.views : 0;
    });

    return NextResponse.json({ views: viewsMap });
  } catch (error) {
    console.error('Error fetching batch views:', error);
    return NextResponse.json(
      { error: 'Internal Server Error fetching batch views' },
      { status: 500 }
    );
  }
}
