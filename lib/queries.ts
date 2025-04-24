import { ObjectId } from 'mongodb';
import { getDb } from './mongodb';

// Add query constants to maintain backward compatibility with existing code
export const STARTUPS_QUERY = 'startups';
export const STARTUP_BY_ID = 'startup.byId';
export const STARTUPS_BY_AUTHOR_QUERY = 'startups.byAuthor';
export const AUTHOR_BY_ID_QUERY = 'author.byId';
export const AUTHOR_BY_EMAIL_QUERY = 'author.byEmail';
export const AUTHOR_BY_USERNAME_QUERY = 'author.byUsername';
export const STARTUP_VIEWS_QUERY = 'startup.views';
export const PLAYLIST_BY_SLUG_QUERY = 'playlist.bySlug';

export async function getStartups(search?: string) {
  const db = await getDb();
  let query = {};
  let authorIds: ObjectId[] = [];

  if (search) {
    // Find authors matching name or username
    const authorMatches = await db
      .collection('authors')
      .find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
        ],
      })
      .project({ _id: 1 })
      .toArray();
    authorIds = authorMatches.map((a) => a._id);

    query = {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        ...(authorIds.length > 0 ? [{ author: { $in: authorIds } }] : []),
      ],
    };
  }

  const startups = await db.collection('startups').find(query).sort({ createdAt: -1 }).toArray();

  // Get all unique author IDs from startups
  const allAuthorIds = [...new Set(startups.map((startup) => startup.author?.toString()))]
    .filter(Boolean)
    .map((id) => new ObjectId(id));

  // Fetch all authors in one query
  const authors = allAuthorIds.length
    ? await db
        .collection('authors')
        .find({ _id: { $in: allAuthorIds } })
        .toArray()
    : [];

  // Map author data to each startup
  return startups.map((startup) => ({
    ...startup,
    _id: startup._id.toString(),
    author: authors.find((author) => author._id.toString() === startup.author?.toString()) || null,
  }));
}

export async function getStartupsByAuthor(username: string) {
  const db = await getDb();

  // First find the author
  const author = await db.collection('authors').findOne({ username });
  if (!author) return [];

  // Then find startups by that author
  const startups = await db
    .collection('startups')
    .find({ author: new ObjectId(author._id) })
    .sort({ createdAt: -1 })
    .toArray();

  return startups.map((startup) => ({
    ...startup,
    _id: startup._id.toString(),
    author,
  }));
}

export async function getStartupById(id: string) {
  const db = await getDb();
  const startup = await db.collection('startups').findOne({ _id: new ObjectId(id) });

  if (startup) {
    // Fetch the author information
    const author = await db
      .collection('authors')
      .findOne({ _id: new ObjectId(startup.author.toString()) });
    return {
      ...startup,
      _id: startup._id.toString(),
      author,
    };
  }

  return null;
}

export async function getPlaylistBySlug(slug: string) {
  const db = await getDb();
  const playlist = await db.collection('playlists').findOne({ 'slug.current': slug });

  if (!playlist) return null;

  // Get author information if author field exists
  if (playlist.author) {
    const authorId =
      playlist.author instanceof ObjectId ? playlist.author : new ObjectId(playlist.author);
    const author = await db.collection('authors').findOne({ _id: authorId });

    return {
      ...playlist,
      _id: playlist._id.toString(),
      author,
    };
  }

  return {
    ...playlist,
    _id: playlist._id.toString(),
  };
}

export async function getStartupViews(id: string) {
  const db = await getDb();
  try {
    const startup = await db
      .collection('startups')
      .findOne(
        { _id: typeof id === 'string' ? new ObjectId(id) : id },
        { projection: { views: 1 } }
      );
    return startup?.views || 0;
  } catch (error) {
    throw new Error(
      `Error fetching startup views: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getAuthorById(id: string) {
  const db = await getDb();
  try {
    // Try to find by 'id' (OAuth provider ID)
    let author = await db.collection('authors').findOne({ id });
    // If not found, try by MongoDB _id
    if (!author && ObjectId.isValid(id)) {
      author = await db.collection('authors').findOne({ _id: new ObjectId(id) });
    }
    return author ? { ...author, _id: author._id.toString() } : null;
  } catch (error) {
    throw new Error(
      `Error in getAuthorById: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getAuthorByEmail(email: string) {
  const db = await getDb();
  try {
    const author = await db.collection('authors').findOne({ email });
    return author ? { ...author, _id: author._id.toString() } : null;
  } catch (error) {
    throw new Error(
      `Error in getAuthorByEmail: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getAuthorByUsername(username: string) {
  const db = await getDb();
  try {
    const author = await db.collection('authors').findOne({ username });
    return author ? { ...author, _id: author._id.toString() } : null;
  } catch (error) {
    throw new Error(
      `Error in getAuthorByUsername: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
