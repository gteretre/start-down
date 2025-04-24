import { ObjectId } from 'mongodb';
import { getDb } from './mongodb';
import { Author, Startup } from './models';

// Startup related functions
export async function createStartup(startup: Omit<Startup, '_id' | 'createdAt'>) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database connection failed');
  }

  // Validate required fields
  if (!startup.title || !startup.description || !startup.author) {
    throw new Error('Missing required fields for startup');
  }

  // Make sure author field is an ObjectId
  let authorObjectId;
  try {
    authorObjectId =
      typeof startup.author === 'string' ? new ObjectId(startup.author) : startup.author;
  } catch (error) {
    throw new Error('Invalid author ID format: ' + error.message);
  }

  // Create the document with proper ObjectId
  const startupDoc = {
    ...startup,
    author: authorObjectId,
    createdAt: new Date(),
    views: 0,
  };

  const result = await db.collection('startups').insertOne(startupDoc);

  if (!result || !result.insertedId) {
    throw new Error('Failed to insert startup into database');
  }

  // Return the created startup with its new ID
  return {
    _id: result.insertedId.toString(),
    ...startup,
    createdAt: new Date(),
    views: 0,
  };
}

export async function updateStartupViews(id: string) {
  const db = await getDb();
  console.log('Updating views for startup with ID:', id);
  try {
    const result = await db
      .collection('startups')
      .updateOne({ _id: typeof id === 'string' ? new ObjectId(id) : id }, { $inc: { views: 1 } });

    return result.modifiedCount > 0;
  } catch (error) {
    throw new Error(
      `Error updating startup views: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function createAuthor(author: Omit<Author, '_id'>) {
  const db = await getDb();
  // Ensure 'id' is present (OAuth provider ID or generated)
  const authorData = {
    ...author,
    createdAt: new Date(),
  };
  const result = await db.collection('authors').insertOne(authorData);

  return {
    _id: result.insertedId.toString(),
    ...authorData,
  };
}
