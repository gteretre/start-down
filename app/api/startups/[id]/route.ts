import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

import { auth } from '@/lib/auth';
import { getAuthorByUsername } from '@/lib/queries';
import { ObjectId } from 'mongodb';
import { validateForm } from '@/lib/validation';
import { rateLimit } from '@/api-middleware/rateLimits';

type RouteContext = { params: Promise<{ id: string | string[] | undefined }> };

const resolveIdParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { limited } = rateLimit(req, { windowMs: 60_000 * 20, max: 10 });
  if (limited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  try {
    const session = await auth();
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const db = await getDb();
    const params = await context.params;
    const startupId = resolveIdParam(params?.id);
    if (!startupId) {
      return NextResponse.json({ error: 'Missing startup id.' }, { status: 400 });
    }
    const startup = await db.collection('startups').findOne({ _id: new ObjectId(startupId) });
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
      { _id: new ObjectId(startupId) },
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
    if (error instanceof Error) {
      console.error('[Startup PATCH] Error:', error.message, error.stack);
    } else {
      console.error('[Startup PATCH] Unknown error:', error);
    }
    return NextResponse.json({ error: 'Failed to update startup.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { limited } = rateLimit(req, { windowMs: 60_000, max: 2 });
  if (limited) {
    return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 });
  }
  try {
    const session = await auth();
    if (!session?.user?.username) {
      return NextResponse.json({ success: false, message: 'Not authenticated.' }, { status: 401 });
    }
    const db = await getDb();
    const params = await context.params;
    const startupId = resolveIdParam(params?.id);
    if (!startupId) {
      return NextResponse.json({ success: false, message: 'Missing startup id.' }, { status: 400 });
    }
    const startup = await db.collection('startups').findOne({ _id: new ObjectId(startupId) });
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
    await db.collection('comments').deleteMany({ startupId });
    const result = await db.collection('startups').deleteOne({ _id: new ObjectId(startupId) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: 'Startup not found.' }, { status: 404 });
    }
    return NextResponse.json(
      { success: true, message: 'Startup and associated comments deleted successfully.' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error('[Startup DELETE] Error:', error.message, error.stack);
    } else {
      console.error('[Startup DELETE] Unknown error:', error);
    }
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
export async function POST() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
export async function PUT() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
