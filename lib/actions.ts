'use server';
import { auth } from '@/lib/auth';
import { parseServerActionResponse, slugify } from './utils';
import { getAuthorByUsername } from '@/lib/queries';
import { createStartup } from '@/lib/mutations';
import type { RawStartup } from '@/lib/models';
import { sanitizeName, sanitizeUsername, sanitizeImage, sanitizeBio } from './validation';
import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';

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
      likes: 0,
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
      startupId: new ObjectId(startupId),
      userUpvotes: [],
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

export const deleteComment = async (commentId: string) => {
  try {
    const session = await auth();
    if (!session || !session.user || !('username' in session.user) || !session.user.username) {
      return { success: false, error: 'You must be signed in to delete a comment.' };
    }
    const db = await getDb();
    const author = await getAuthorByUsername(session.user.username);
    if (!author) {
      return { success: false, error: 'Could not find your user profile.' };
    }
    const result = await db
      .collection('comments')
      .deleteOne({ _id: new ObjectId(commentId), author: author._id });
    if (result.deletedCount === 0) {
      return { success: false, error: 'Failed to delete comment.' };
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { success: false, error: 'Failed to delete comment.' };
  }
};

export const upvoteComment = async (commentId: string) => {
  try {
    const session = await auth();
    if (!session || !session.user || !('username' in session.user) || !session.user.username) {
      return { success: false, error: 'You must be signed in to upvote.' };
    }
    const db = await getDb();
    const author = await getAuthorByUsername(session.user.username);
    if (!author || !author._id) {
      return { success: false, error: 'User not found.' };
    }
    const userObjectId = new ObjectId(author._id);
    const comment = await db.collection('comments').findOne({ _id: new ObjectId(commentId) });
    if (!comment) {
      return { success: false, error: 'Comment not found.' };
    }
    const userUpvotes = Array.isArray(comment.userUpvotes)
      ? comment.userUpvotes.map((id: ObjectId | string) => id.toString())
      : [];
    const hasUpvoted = userUpvotes.includes(userObjectId.toString());
    let updateResult;
    if (hasUpvoted) {
      updateResult = await db.collection('comments').updateOne({ _id: new ObjectId(commentId) }, {
        $inc: { upvotes: -1 },
        $pull: { userUpvotes: { $in: [userObjectId, userObjectId.toString()] } },
      } as unknown as import('mongodb').UpdateFilter<import('mongodb').Document>);
    } else {
      updateResult = await db.collection('comments').updateOne(
        { _id: new ObjectId(commentId), userUpvotes: { $ne: userObjectId } },
        {
          $inc: { upvotes: 1 },
          $addToSet: { userUpvotes: userObjectId },
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
    if (forbiddenNames.includes(username.toLowerCase().trim())) {
      return { error: 'This username is not allowed. Please choose another username.' };
    }
    if (username.length < 6 || username.length > 50) {
      return { error: 'Username must be between 6 and 50 characters.' };
    }
    if (bio.length > 500) {
      return { error: 'Bio must be at most 500 characters.' };
    }
    if (username !== currentUser.username) {
      const existing = await db.collection('authors').findOne({ username });
      if (existing && existing._id.toString() !== currentUser._id) {
        return { error: 'Username already taken' };
      }
    }
    const updateResult = await db
      .collection('authors')
      .updateOne({ _id: new ObjectId(currentUser._id) }, { $set: { name, username, image, bio } });
    if (updateResult.modifiedCount !== 1) {
      return { error: 'Failed to update profile' };
    }
    const updatedUser = await db
      .collection('authors')
      .findOne({ _id: new ObjectId(currentUser._id) });
    if (!updatedUser) {
      return { error: 'Failed to fetch updated user' };
    }
    return {
      status: 'SUCCESS',
      user: {
        name: updatedUser.name,
        username: updatedUser.username,
        bio: updatedUser.bio,
        image: updatedUser.image,
      },
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error: 'Failed to update profile' };
  }
}

export async function updateStartup(
  id: string,
  form: {
    description: string;
    category: string;
    link: string;
    pitch: string;
  }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !('username' in session.user) || !session.user.username) {
      return { status: 'ERROR', error: 'Not authenticated' };
    }
    const db = await getDb();
    const startup = await db.collection('startups').findOne({ _id: new ObjectId(id) });
    if (!startup) {
      return { status: 'ERROR', error: 'Startup not found' };
    }
    // Only the author can update
    const author = await getAuthorByUsername(session.user.username);
    if (!author || String(startup.author) !== String(author._id)) {
      return { status: 'ERROR', error: 'You are not authorized to update this startup.' };
    }
    // Sanitize and validate fields (title and slug are not updatable)
    const description = (form.description || '').trim();
    const category = (form.category || '').trim();
    const image = (form.link || '').trim();
    const pitch = (form.pitch || '').trim();
    if (!description || !category || !pitch) {
      return { status: 'ERROR', error: 'All fields except image are required.' };
    }
    // Optionally, add more validation here
    const updateResult = await db.collection('startups').updateOne(
      { _id: new ObjectId(id) },
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
      return { status: 'ERROR', error: 'Failed to update startup.' };
    }
    return { status: 'SUCCESS' };
  } catch (error) {
    console.error('Error updating startup:', error);
    return { status: 'ERROR', error: 'Failed to update startup.' };
  }
}

export async function deleteStartup(id: string) {
  try {
    const session = await auth();
    if (!session || !session.user || !('username' in session.user) || !session.user.username) {
      return { success: false, message: 'Not authenticated.' };
    }
    const db = await getDb();
    const startup = await db.collection('startups').findOne({ _id: new ObjectId(id) });
    if (!startup) {
      return { success: false, message: 'Startup not found.' };
    }
    const author = await getAuthorByUsername(session.user.username);
    if (!author || String(startup.author) !== String(author._id)) {
      return { success: false, message: 'You are not authorized to delete this startup.' };
    }
    await db.collection('comments').deleteMany({ startupId: id });
    const result = await db.collection('startups').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      console.warn('No startup found to delete with id:', id);
      return { success: false, message: 'Startup not found.' };
    }
    return { success: true, message: 'Startup and associated comments deleted successfully.' };
  } catch (error) {
    console.error('Error in deleteStartup:', error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
    };
  }
}

export async function toggleLikeStartup(id: string, username: string) {
  try {
    const db = await getDb();
    const author = await db.collection('authors').findOne({ username });
    if (!author || !author._id) {
      throw new Error('User not found');
    }
    const userObjectId = new ObjectId(author._id);
    const startup = await db.collection('startups').findOne({ _id: new ObjectId(id) });
    if (!startup) {
      return { success: false, message: 'Startup not found.' };
    }
    const hasLiked =
      Array.isArray(startup.userLikes) &&
      startup.userLikes.some((u: ObjectId) => u.toString() === userObjectId.toString());
    let updateResult;
    if (hasLiked) {
      updateResult = await db
        .collection<RawStartup>('startups')
        .updateOne(
          { _id: new ObjectId(id) },
          { $pull: { userLikes: userObjectId }, $inc: { likes: -1 } }
        );
    } else {
      updateResult = await db
        .collection('startups')
        .updateOne(
          { _id: new ObjectId(id), userLikes: { $ne: userObjectId } },
          { $addToSet: { userLikes: userObjectId }, $inc: { likes: 1 } }
        );
    }
    if (updateResult.modifiedCount === 0) {
      return { success: false, message: 'Failed to update like.' };
    }
    return { success: true, toggled: !hasLiked };
  } catch (error) {
    console.error('Error in toggleLikeStartup:', error);
    throw new Error(
      error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
    );
  }
}

export async function hasViewedInWindow(startupId: string, username: string, windowMs: number) {
  const author = await getAuthorByUsername(username);
  if (!author || !author._id) return null;
  const db = await getDb();
  const record = await db.collection('startup_views').findOne({
    startupId: new ObjectId(startupId),
    visitorId: new ObjectId(author._id),
  });
  if (!record) return false;
  const now = Date.now();
  return record.lastViewed && now - new Date(record.lastViewed).getTime() < windowMs;
}
