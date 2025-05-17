import { ObjectId } from 'mongodb';
import { getDb } from './mongodb';
import { Author, Startup } from './models';
import { getAuthorByUsername } from './queries';

export async function createStartup(
  startup: Omit<Startup, '_id' | 'createdAt' | 'author'> & { author: string }
) {
  try {
    const db = await getDb();
    if (!db) {
      console.error('Database connection failed');
      throw new Error('A server error occurred. Please try again later.');
    }
    if (!startup.title || !startup.description || !startup.author) {
      console.error('Missing required fields for startup:', startup);
      throw new Error('Some required fields are missing. Please check your input.');
    }

    let authorObjectId;
    try {
      authorObjectId = new ObjectId(startup.author);
    } catch (error) {
      console.error('Invalid author ID format:', error);
      throw new Error('There was a problem with your account. Please contact support.');
    }

    const startupDoc = {
      ...startup,
      author: authorObjectId,
      createdAt: new Date(),
      views: 0,
      likes: 0,
    };
    const result = await db.collection('startups').insertOne(startupDoc);

    if (!result || !result.insertedId) {
      console.error('Failed to insert startup into database:', startupDoc);
      throw new Error('Failed to create the startup. Please try again later.');
    }
    return {
      _id: result.insertedId.toString(),
      ...startup,
      createdAt: new Date(),
      views: 0,
    };
  } catch (error) {
    console.error('Error in createStartup:', error);
    throw new Error(
      error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
    );
  }
}

export async function updateStartupViews(id: string) {
  try {
    const db = await getDb();
    const result = await db
      .collection('startups')
      .updateOne({ _id: typeof id === 'string' ? new ObjectId(id) : id }, { $inc: { views: 1 } });

    if (result.modifiedCount === 0) {
      console.warn('No startup found to update views for id:', id);
    }
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating startup views:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Could not update views. Please try again.'
    );
  }
}

export async function createAuthor(author: Omit<Author, '_id'>) {
  try {
    const db = await getDb();
    if (!author.provider) {
      console.error('Provider is required for author:', author);
      throw new Error('Provider is required for author.');
    }
    const authorData = {
      ...author,
      createdAt: new Date(),
    };
    const result = await db.collection('authors').insertOne(authorData);

    if (!result || !result.insertedId) {
      console.error('Failed to insert author into database:', authorData);
      throw new Error('Failed to create author. Please try again.');
    }
    return {
      _id: result.insertedId.toString(),
      ...authorData,
    };
  } catch (error) {
    console.error('Error in createAuthor:', error);
    throw new Error(
      error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
    );
  }
}

export async function deleteUser(username: string) {
  try {
    const db = await getDb();
    const result = await db.collection('authors').deleteOne({ username });
    if (result.deletedCount === 0) {
      console.warn('No user found to delete with username:', username);
      return { success: false, message: 'User not found.' };
    }
    return { success: true, message: 'User deleted successfully.' };
  } catch (error) {
    console.error('Error in deleteUser:', error);
    throw new Error(
      error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
    );
  }
}

export async function deleteStartup(id: string) {
  try {
    const db = await getDb();
    const result = await db.collection('startups').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      console.warn('No startup found to delete with id:', id);
      return { success: false, message: 'Startup not found.' };
    }
    return { success: true, message: 'Startup deleted successfully.' };
  } catch (error) {
    console.error('Error in deleteStartup:', error);
    throw new Error(
      error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
    );
  }
}

export async function upsertViewTimestamp(startupId: string, username: string) {
  const author = await getAuthorByUsername(username);
  if (!author || !author._id) return null;
  const db = await getDb();
  await db
    .collection('startup_views')
    .updateOne(
      { startupId: new ObjectId(startupId), visitorId: new ObjectId(author._id) },
      { $set: { lastViewed: new Date() } },
      { upsert: true }
    );
}
