'use server';
import { auth } from '@/lib/auth';
import { parseServerActionResponse, slugify } from './utils';
import { getAuthorByUsername } from '@/lib/queries';
import { createStartup } from '@/lib/mutations';
import { sanitizeName, sanitizeUsername, sanitizeImage, sanitizeBio } from './validation';
import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';

const forbiddenNames = [
  'admin',
  'test',
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
];

export const createPitch = async (state: unknown, form: FormData, pitch: string) => {
  try {
    const session = await auth();
    if (!session) {
      return parseServerActionResponse({
        error: 'You must be signed in to submit a startup.',
        status: 'ERROR',
      });
    }

    const formEntries = Array.from(form.entries());
    const formData = Object.fromEntries(formEntries);
    const { title, description, category, link } = formData;
    if (!title || !description || !category || !pitch) {
      return parseServerActionResponse({
        error: 'Please fill in all required fields.',
        status: 'ERROR',
      });
    }

    if (forbiddenNames.includes((title as string).toLowerCase().trim())) {
      return parseServerActionResponse({
        error: 'This project name is not allowed. Please choose another name.',
        status: 'ERROR',
      });
    }

    const checkSlugExists = async (slug: string) => {
      const db = await import('./mongodb').then((m) => m.getDb());
      const existing = await db.collection('startups').findOne({ slug });
      return !!existing;
    };

    const slug = await slugify(title as string, checkSlugExists);

    if (!session.user || !('username' in session.user) || !session.user.username) {
      return parseServerActionResponse({
        error: 'Your user session is invalid. Please sign in again.',
        status: 'ERROR',
      });
    }
    const author = await getAuthorByUsername(session.user.username);

    if (!author) {
      return parseServerActionResponse({
        error: 'Could not find your user profile. Please contact support.',
        status: 'ERROR',
      });
    }

    const startup = {
      title: title as string,
      description: description as string,
      category: category as string,
      image: link as string,
      slug: slug,
      author: author._id,
      pitch,
      views: 0,
    };

    const result = await createStartup(startup);

    if (!result || !result._id) {
      return parseServerActionResponse({
        error: 'Failed to create your startup. Please try again later.',
        status: 'ERROR',
      });
    }

    return parseServerActionResponse({
      ...result,
      error: '',
      status: 'SUCCESS',
    });
  } catch (error) {
    console.error('Error in createPitch:', error);
    let message = 'An unexpected error occurred. Please try again.';
    if (error instanceof Error && error.message) {
      if (error.message.includes('database')) {
        message = 'A server error occurred. Please try again later.';
      } else if (error.message.includes('author ID format')) {
        message = 'There was a problem with your account. Please contact support.';
      }
    }
    return parseServerActionResponse({
      error: message,
      status: 'ERROR',
    });
  }
};

export const createComment = async (startupId: string, text: string) => {
  try {
    const session = await auth();
    if (!session || !session.user || !('username' in session.user) || !session.user.username) {
      return { error: 'You must be signed in to comment.' };
    }
    if (!text || !startupId) {
      return { error: 'Missing comment text or startup ID.' };
    }
    const db = await getDb();
    const author = await getAuthorByUsername(session.user.username);
    if (!author) {
      return { error: 'Could not find your user profile.' };
    }
    const comment = {
      author: new ObjectId(author._id),
      createdAt: new Date(),
      upvotes: 0,
      text,
      startupId,
    };
    const result = await db.collection('comments').insertOne(comment);
    if (!result.insertedId) {
      return { error: 'Failed to create comment.' };
    }
    return {
      comment: {
        ...comment,
        _id: result.insertedId.toString(),
        author: author,
      },
      error: '',
    };
  } catch (error) {
    console.error('Error creating comment:', error);
    return { error: 'Failed to create comment.' };
  }
};

export const upvoteComment = async (commentId: string) => {
  try {
    const session = await auth();
    if (!session || !session.user || !('username' in session.user) || !session.user.username) {
      return { success: false, error: 'You must be signed in to upvote.' };
    }
    const db = await getDb();
    const comment = await db.collection('comments').findOne({ _id: new ObjectId(commentId) });
    if (!comment) {
      return { success: false, error: 'Comment not found.' };
    }
    const userUpvotes = comment.userUpvotes || [];
    const hasUpvoted = userUpvotes.includes(session.user.username);
    let updateResult;
    if (hasUpvoted) {
      // Remove upvote
      updateResult = await db.collection('comments').updateOne(
        { _id: new ObjectId(commentId) },
        {
          $inc: { upvotes: -1 },
          $pull: { userUpvotes: session.user.username },
        }
      );
    } else {
      // Add upvote
      updateResult = await db.collection('comments').updateOne(
        { _id: new ObjectId(commentId) },
        {
          $inc: { upvotes: 1 },
          $addToSet: { userUpvotes: session.user.username },
        }
      );
    }
    if (updateResult.modifiedCount === 0) {
      return { success: false, error: 'Failed to update upvote.' };
    }
    return { success: true, toggled: !hasUpvoted };
  } catch (error) {
    console.error('Error in upvoteComment:', error);
    return { success: false, error: 'An error occurred while upvoting.' };
  }
};

export async function updateProfile(form: {
  name: string;
  username: string;
  image: string;
  bio: string;
}) {
  try {
    const session = await auth();
    if (!session || !session.user || !('username' in session.user) || !session.user.username) {
      return { error: 'Not authenticated' };
    }
    const db = await getDb();
    const currentUser = await getAuthorByUsername(session.user.username);
    if (!currentUser) {
      return { error: 'User not found' };
    }
    const name = sanitizeName(form.name);
    const username = sanitizeUsername(form.username);
    const image = sanitizeImage(form.image);
    const bio = sanitizeBio(form.bio);
    if (username !== currentUser.username) {
      const existing = await db.collection('authors').findOne({ username });
      if (existing && existing._id.toString() !== currentUser._id) {
        return { error: 'Username already taken' };
      }
    }
    console.log('old bio:', currentUser.bio);
    console.log('new bio:', bio);
    await db
      .collection('authors')
      .updateOne({ _id: new ObjectId(currentUser._id) }, { $set: { name, username, image, bio } });
    return { error: '' };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error: 'Failed to update profile' };
  }
}
