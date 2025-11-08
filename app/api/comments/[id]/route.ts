import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

import { getDb } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/api-middleware/rateLimits';

type RouteContext = { params: Promise<{ id: string | string[] | undefined }> };

const resolveIdParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { limited } = rateLimit(req, { windowMs: 60_000, max: 6 });
  if (limited) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
  }

  const params = await context.params;
  const commentId = resolveIdParam(params?.id);
  if (!commentId) {
    return NextResponse.json(
      { success: false, error: 'Missing comment identifier.' },
      { status: 400 }
    );
  }

  const session = await auth();
  if (!session?.user?.username) {
    return NextResponse.json(
      { success: false, error: 'You must be signed in to delete a comment.' },
      { status: 401 }
    );
  }

  const db = await getDb();
  const author = await db.collection('authors').findOne({ username: session.user.username });
  if (!author) {
    return NextResponse.json(
      { success: false, error: 'Could not find your user profile.' },
      { status: 404 }
    );
  }

  try {
    const result = await db
      .collection('comments')
      .deleteOne({ _id: new ObjectId(commentId), author: author._id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete comment.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('[Comment DELETE] Error:', error.message, error.stack);
    } else {
      console.error('[Comment DELETE] Unknown error:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Failed to delete comment due to a database error.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { limited } = rateLimit(req, { windowMs: 60_000 * 10, max: 5 });
  if (limited) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
  }

  const params = await context.params;
  const commentId = resolveIdParam(params?.id);
  if (!commentId) {
    return NextResponse.json(
      { success: false, error: 'Missing comment identifier.' },
      { status: 400 }
    );
  }

  const session = await auth();
  if (!session?.user?.username) {
    return NextResponse.json({ success: false, error: 'You must be signed in.' }, { status: 401 });
  }

  const db = await getDb();
  const author = await db.collection('authors').findOne({ username: session.user.username });
  if (!author) {
    return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
  }

  const comment = await db.collection('comments').findOne({ _id: new ObjectId(commentId) });
  if (!comment) {
    return NextResponse.json({ success: false, error: 'Comment not found.' }, { status: 404 });
  }

  const hasUpvoted = (comment.userUpvotes || []).some(
    (uid: ObjectId | string) => String(uid) === String(author._id)
  );

  const update = hasUpvoted
    ? {
        $pull: { userUpvotes: author._id },
        $inc: { upvotes: -1 },
      }
    : {
        $addToSet: { userUpvotes: author._id },
        $inc: { upvotes: 1 },
      };

  try {
    // @ts-expect-error MongoDB driver typing issue: $pull with ObjectId is valid
    await db.collection('comments').updateOne({ _id: new ObjectId(commentId) }, update);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      console.error('[Comment Upvote POST] Error:', error.message, error.stack);
    } else {
      console.error('[Comment Upvote POST] Unknown error:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Failed to upvote/downvote comment.' },
      { status: 500 }
    );
  }
}
