import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

import { getDb } from '@/lib/mongodb';
import { auth } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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
    console.error('Error deleting comment:', e);
    return NextResponse.json(
      { success: false, error: 'Failed to delete comment due to a database error.' },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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
  // @ts-expect-error MongoDB driver typing issue: $pull with ObjectId is valid
  await db.collection('comments').updateOne({ _id: new ObjectId(commentId) }, update);
  return NextResponse.json({ success: true });
}
