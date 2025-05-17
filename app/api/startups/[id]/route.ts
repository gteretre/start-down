import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

import { auth } from '@/lib/auth';
import { getAuthorByUsername } from '@/lib/queries';
import { ObjectId } from 'mongodb';
import { validateForm } from '@/lib/validation';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const db = await getDb();
    const startup = await db
      .collection('startups')
      .findOne({ _id: new ObjectId((await params).id) });
    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }
    const author = await getAuthorByUsername(session.user.username);
    if (!author || String(startup.author) !== String(author._id)) {
      return NextResponse.json(
        { error: 'You are not authorized to update this startup.' },
        { status: 403 }
      );
    }
    const data = await req.json();
    const { description, category, image, pitch } = data;
    const errors = validateForm({
      title: startup.title,
      description,
      category,
      image,
      pitch,
    });
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }
    const updateResult = await db.collection('startups').updateOne(
      { _id: new ObjectId((await params).id) },
      {
        $set: {
          description,
          category,
          image,
          pitch,
        },
      }
    );
    if (updateResult.modifiedCount !== 1) {
      return NextResponse.json({ error: 'Failed to update startup.' }, { status: 500 });
    }
    return NextResponse.json({ status: 'SUCCESS' });
  } catch (error) {
    console.error('Error updating startup:', error);
    return NextResponse.json({ error: 'Failed to update startup.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.username) {
      return NextResponse.json({ success: false, message: 'Not authenticated.' }, { status: 401 });
    }
    const db = await getDb();
    const startup = await db
      .collection('startups')
      .findOne({ _id: new ObjectId((await params).id) });
    if (!startup) {
      return NextResponse.json({ success: false, message: 'Startup not found.' }, { status: 404 });
    }
    const author = await getAuthorByUsername(session.user.username);
    if (!author || String(startup.author) !== String(author._id)) {
      return NextResponse.json(
        { success: false, message: 'You are not authorized to delete this startup.' },
        { status: 403 }
      );
    }
    await db.collection('comments').deleteMany({ startupId: (await params).id });
    const result = await db
      .collection('startups')
      .deleteOne({ _id: new ObjectId((await params).id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: 'Startup not found.' }, { status: 404 });
    }
    return NextResponse.json(
      { success: true, message: 'Startup and associated comments deleted successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting startup:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
