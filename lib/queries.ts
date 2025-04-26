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

type RawAuthor = {
  _id: string | ObjectId;
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  createdAt?: Date | string;
  image?: string;
  bio?: string;
};

type RawStartup = {
  _id: string | ObjectId;
  title?: string;
  slug?: { current: string };
  createdAt?: Date | string;
  author: RawAuthor;
  views?: number;
  description?: string;
  category?: string;
  image?: string;
  pitch?: string;
};

function mapAuthor(raw: RawAuthor): import('./models').Author {
  return {
    _id: raw._id?.toString() || '',
    id: raw.id || '',
    name: raw.name || '',
    username: raw.username || '',
    email: raw.email || '',
    createdAt:
      raw.createdAt instanceof Date ? raw.createdAt : new Date(raw.createdAt ?? Date.now()),
    image: raw.image || '',
    bio: raw.bio || '',
  };
}

function mapStartup(raw: RawStartup, authorObj: RawAuthor): import('./models').Startup {
  return {
    _id: raw._id?.toString() || '',
    title: raw.title || '',
    slug: raw.slug || { current: '' },
    createdAt:
      raw.createdAt instanceof Date ? raw.createdAt : new Date(raw.createdAt ?? Date.now()),
    author: mapAuthor(authorObj),
    views: typeof raw.views === 'number' ? raw.views : 0,
    description: raw.description || '',
    category: raw.category || '',
    image: raw.image || '',
    pitch: raw.pitch || '',
  };
}

export async function getStartups(search?: string, sort?: string) {
  const db = await getDb();
  let query = {};
  let authorIds: ObjectId[] = [];
  let sortObj: Record<string, 1 | -1> = { createdAt: -1 };

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

  switch (sort) {
    case 'createdAt-asc':
      sortObj = { createdAt: 1 };
      break;
    case 'createdAt-desc':
      sortObj = { createdAt: -1 };
      break;
    case 'views-asc':
      sortObj = { views: 1 };
      break;
    case 'views-desc':
      sortObj = { views: -1 };
      break;
    case 'title-asc':
      sortObj = { title: 1 };
      break;
    case 'title-desc':
      sortObj = { title: -1 };
      break;
    default:
      break;
  }

  const startups = await db.collection('startups').find(query).sort(sortObj).toArray();

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
  return startups
    .filter((startup) => !!startup.author) // Only include startups with an author field
    .map((startup) => {
      const authorObj = authors.find(
        (author) => author._id.toString() === startup.author?.toString()
      );
      return mapStartup(startup as RawStartup, authorObj as RawAuthor);
    });
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

  return startups
    .filter((startup) => !!startup.author)
    .map((startup) => mapStartup(startup as RawStartup, author as RawAuthor));
}

export async function getStartupById(id: string) {
  const db = await getDb();
  const startup = await db.collection('startups').findOne({ _id: new ObjectId(id) });

  if (startup) {
    // Fetch the author information
    const author = await db
      .collection('authors')
      .findOne({ _id: new ObjectId(startup.author.toString()) });
    if (startup && author && startup.author) {
      return mapStartup(startup as RawStartup, author as RawAuthor);
    }
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
