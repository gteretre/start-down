import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

import { getDb } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/api-middleware/rateLimits';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { limited } = rateLimit(req, { windowMs: 60_000, max: 6 });
  if (limited) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
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
      .deleteOne({ _id: new ObjectId((await params).id), author: author._id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete comment.' },
        {
          status: 403,
        }
      );
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    if (e instanceof Error) {
      console.error('[Comment DELETE] Error:', e.message, e.stack);
    } else {
      console.error('[Comment DELETE] Unknown error:', e);
    }
    return NextResponse.json(
      { success: false, error: 'Failed to delete comment due to a database error.' },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { limited } = rateLimit(req, { windowMs: 60_000 * 10, max: 5 });
  if (limited) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
  }
  const session = await auth();
  if (!session?.user?.username) {
    return NextResponse.json({ success: false, error: 'You must be signed in.' }, { status: 401 });
  }
  const db = await getDb();
  const commentId = params.id;
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
  let update;
  if (hasUpvoted) {
    update = {
      $pull: { userUpvotes: author._id },
      $inc: { upvotes: -1 },
    };
  } else {
    update = {
      $addToSet: { userUpvotes: author._id },
      $inc: { upvotes: 1 },
    };
  }
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
