import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

import { getDb } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { getCommentsByStartupId } from '@/lib/queries';

const MAX_LIMIT = 20;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startupId = searchParams.get('startupId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(MAX_LIMIT, parseInt(searchParams.get('limit') || '20', 10));

    if (!startupId) {
      return new Response(JSON.stringify({ error: 'Missing startupId' }), { status: 400 });
    }

    const session = await auth();
    const currentUsername = session?.user?.username;

    const { comments, hasMore } = await getCommentsByStartupId(
      startupId,
      currentUsername,
      page,
      limit
    );

    return Response.json({ comments, hasMore });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch comments' }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.username) {
    return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });
  }
  const db = await getDb();
  const { startupId, text } = await req.json();
  if (!startupId || !text) {
    return NextResponse.json({ error: 'Missing startupId or text.' }, { status: 400 });
  }
  const author = await db.collection('authors').findOne({ username: session.user.username });
  if (!author) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }
  const comment = {
    startupId: new ObjectId(startupId),
    text,
    author: author._id,
    createdAt: new Date(),
    upvotes: 0,
    userUpvotes: [],
  };
  const result = await db.collection('comments').insertOne(comment);
  if (!result.insertedId) {
    return NextResponse.json({ error: 'Failed to create comment.' }, { status: 500 });
  }
  return NextResponse.json(
    {
      comment: {
        ...comment,
        _id: result.insertedId,
        author: { username: author.username, image: author.image },
      },
    },
    { status: 201 }
  );
}
