import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

import { getDb } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { getAuthorByUsername } from '@/lib/queries';
import { slugify } from '@/lib/utils';
import { validateForm } from '@/lib/validation';

const forbiddenNames = [
  'admin',
  'test',
  'test1',
  'test2',
  'test_creation',
  'null',
  'undefined',
  'root',
  'system',
  'moderator',
  'support',
  'help',
  'owner',
  'create',
  'new',
  'add',
  'update',
  'delete',
  'remove',
  'edit',
  'manage',
  'control',
  'settings',
  'config',
  'configuration',
  'setup',
  'demo',
  'example',
];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.username) {
      return NextResponse.json(
        { error: 'You must be signed in to submit a startup.' },
        { status: 401 }
      );
    }
    const data = await req.json();
    const { title, description, category, image, pitch } = data;
    const errors = validateForm({ title, description, category, image, pitch });
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }
    if (forbiddenNames.includes(title.toLowerCase().trim())) {
      return NextResponse.json(
        { error: 'This project name is not allowed. Please choose another name.' },
        { status: 400 }
      );
    }
    const db = await getDb();
    const author = await getAuthorByUsername(session.user.username);
    if (!author) {
      return NextResponse.json({ error: 'Could not find your user profile.' }, { status: 404 });
    }
    const checkSlugExists = async (slug: string) => {
      const existing = await db.collection('startups').findOne({ slug });
      return !!existing;
    };
    const slug = await slugify(title, checkSlugExists);
    const startup = {
      title,
      description,
      category,
      image,
      slug,
      author: new ObjectId(author._id),
      pitch,
      createdAt: new Date(),
      views: 0,
      likes: 0,
    };
    const result = await db.collection('startups').insertOne(startup);
    if (!result.insertedId) {
      return NextResponse.json({ error: 'Failed to create your startup.' }, { status: 500 });
    }
    return NextResponse.json({ _id: result.insertedId.toString(), slug, status: 'SUCCESS' });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'errInfo' in error) {
      console.error(
        'Error creating startup:',
        JSON.stringify((error as { errInfo: unknown }).errInfo, null, 2)
      );
    } else {
      console.error('Error creating startup:', error);
    }
    return NextResponse.json({ error: 'Failed to create startup.' }, { status: 500 });
  }
}
