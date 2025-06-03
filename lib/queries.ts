import { startOfWeek, endOfWeek } from 'date-fns';

import { ObjectId } from 'mongodb';
import { getDb } from './mongodb';
import type { RawAuthor, RawStartup, RawComment } from '@/lib/models';

function mapAuthor(raw: RawAuthor): import('@/lib/models').Author {
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
    role: raw.role || '',
    provider: raw.provider,
    termsAcceptedAt: raw.termsAcceptedAt
      ? raw.termsAcceptedAt instanceof Date
        ? raw.termsAcceptedAt
        : new Date(raw.termsAcceptedAt)
      : undefined,
  };
}

function mapStartup(raw: RawStartup, authorObj: RawAuthor): import('@/lib/models').Startup {
  return {
    _id: raw._id?.toString() || '',
    title: raw.title || '',
    slug: raw.slug || '',
    createdAt:
      raw.createdAt instanceof Date ? raw.createdAt : new Date(raw.createdAt ?? Date.now()),
    author: mapAuthor(authorObj),
    views: typeof raw.views === 'number' ? raw.views : 0,
    description: raw.description || '',
    category: raw.category || '',
    image: raw.image || '',
    pitch: raw.pitch || '',
    likes: typeof raw.likes === 'number' ? raw.likes : 0,
  };
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function getStartups(
  search?: string,
  sort?: string,
  page: number = 1,
  limit: number = 20
) {
  const db = await getDb();
  const MAX_LIMIT = 24;
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, limit));
  let query = {};
  let authorIds: ObjectId[] = [];
  let sortObj: Record<string, 1 | -1> = { createdAt: -1 };

  if (search) {
    const safeSearch = escapeRegex(search);
    const authorMatches = await db
      .collection('authors')
      .find({
        $or: [
          { name: { $regex: safeSearch, $options: 'i' } },
          { username: { $regex: safeSearch, $options: 'i' } },
        ],
      })
      .project({ _id: 1 })
      .toArray();
    authorIds = authorMatches.map((a) => a._id);

    query = {
      $or: [
        { title: { $regex: safeSearch, $options: 'i' } },
        { category: { $regex: safeSearch, $options: 'i' } },
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

  const skip = (Math.max(1, page) - 1) * safeLimit;
  const startups = await db
    .collection('startups')
    .find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(safeLimit)
    .toArray();

  const allAuthorIds = [...new Set(startups.map((startup) => startup.author?.toString()))]
    .filter(Boolean)
    .map((id) => new ObjectId(id));

  const authors = allAuthorIds.length
    ? await db
        .collection('authors')
        .find({ _id: { $in: allAuthorIds } })
        .toArray()
    : [];

  return startups
    .filter((startup) => {
      const authorObj = authors.find(
        (author) => author._id.toString() === startup.author?.toString()
      );
      return !!authorObj;
    })
    .map((startup) => {
      const authorObj = authors.find(
        (author) => author._id.toString() === startup.author?.toString()
      );
      return mapStartup(startup as RawStartup, authorObj as RawAuthor);
    });
}

export async function getStartupsCount(search?: string) {
  const db = await getDb();
  let query = {};
  let authorIds: ObjectId[] = [];

  if (search) {
    const safeSearch = escapeRegex(search);
    const authorMatches = await db
      .collection('authors')
      .find({
        $or: [
          { name: { $regex: safeSearch, $options: 'i' } },
          { username: { $regex: safeSearch, $options: 'i' } },
        ],
      })
      .project({ _id: 1 })
      .toArray();
    authorIds = authorMatches.map((a) => a._id);

    query = {
      $or: [
        { title: { $regex: safeSearch, $options: 'i' } },
        { category: { $regex: safeSearch, $options: 'i' } },
        ...(authorIds.length > 0 ? [{ author: { $in: authorIds } }] : []),
      ],
    };
  }

  return db.collection('startups').countDocuments(query);
}

export async function getStartupsByAuthor(username: string) {
  const db = await getDb();
  const author = await db.collection('authors').findOne({ username });
  if (!author) return [];

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
    const author = await db
      .collection('authors')
      .findOne({ _id: new ObjectId(startup.author.toString()) });
    if (startup && author && startup.author) {
      return mapStartup(startup as RawStartup, author as RawAuthor);
    }
  }

  return null;
}

export async function getStartupBySlug(
  slug: string
): Promise<import('@/lib/models').Startup | null> {
  const db = await getDb();
  const raw = await db.collection('startups').findOne({ slug });
  if (!raw) return null;
  const author = await db.collection('authors').findOne({ _id: raw.author });
  if (!author) return null;
  return mapStartup({ ...raw, author } as RawStartup, author as RawAuthor);
}

export async function getStartupViews(id: string) {
  // !!! This function should be replaced with getStartupStats(id) !!!
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

export async function getStartupStats(id: string) {
  const db = await getDb();
  try {
    const startup = await db
      .collection('startups')
      .findOne(
        { _id: typeof id === 'string' ? new ObjectId(id) : id },
        { projection: { views: 1, likes: 1 } }
      );
    return {
      views: startup?.views || 0,
      likes: startup?.likes || 0,
    };
  } catch (err) {
    throw new Error(
      `Error fetching startup stats: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

export async function getAuthorById(id: string): Promise<import('@/lib/models').Author | null> {
  const db = await getDb();
  try {
    let author = await db.collection('authors').findOne({ id });
    if (!author && ObjectId.isValid(id)) {
      author = await db.collection('authors').findOne({ _id: new ObjectId(id) });
    }
    return author ? mapAuthor(author as RawAuthor) : null;
  } catch (error) {
    console.error('Error in getAuthorById:', error);
    throw new Error(
      `Error in getAuthorById: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getAuthorByEmail(
  email: string
): Promise<import('@/lib/models').Author | null> {
  const db = await getDb();
  try {
    const author = await db.collection('authors').findOne({ email });
    return author ? mapAuthor(author as RawAuthor) : null;
  } catch (error) {
    console.error('Error in getAuthorByEmail:', error);
    throw new Error(
      `Error in getAuthorByEmail: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getAuthorByUsername(
  username: string
): Promise<import('@/lib/models').Author | null> {
  const db = await getDb();
  try {
    const author = await db.collection('authors').findOne({ username });
    return author ? mapAuthor(author as RawAuthor) : null;
  } catch (error) {
    console.error('Error in getAuthorByUsername:', error);
    throw new Error(
      `Error in getAuthorByUsername: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getCommentsByStartupId(
  startupId: string,
  currentUsername?: string,
  page: number = 1,
  limit: number = 20
): Promise<{ comments: import('@/lib/models').Comment[]; hasMore: boolean }> {
  const db = await getDb();
  const MAX_LIMIT = 20;
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, limit));
  const skip = (Math.max(1, page) - 1) * safeLimit;
  const commentsRaw = await db
    .collection('comments')
    .find({ startupId: new ObjectId(startupId) })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(safeLimit + 1)
    .toArray();
  const hasMore = commentsRaw.length > safeLimit;
  const commentsToReturn = hasMore ? commentsRaw.slice(0, safeLimit) : commentsRaw;
  const authorIds = [...new Set(commentsToReturn.map((c) => c.author?.toString()))].filter(Boolean);
  const authors = authorIds.length
    ? await db
        .collection('authors')
        .find({ _id: { $in: authorIds.map((id) => new ObjectId(id)) } })
        .toArray()
    : [];
  let currentUserId: string | null = null;
  if (currentUsername) {
    const user = await db.collection('authors').findOne({ username: currentUsername });
    if (user && user._id) currentUserId = user._id.toString();
  }
  function mapComment(raw: RawComment, authorObj: RawAuthor): import('@/lib/models').Comment {
    const userUpvotes = Array.isArray(raw.userUpvotes)
      ? raw.userUpvotes.map((id) => id.toString())
      : [];
    const hasUpvoted = !!(currentUserId && userUpvotes.includes(currentUserId));
    return {
      _id: raw._id?.toString() || '',
      author: {
        username: authorObj?.username || 'deleted',
        image: authorObj?.image || '',
      },
      createdAt:
        raw.createdAt instanceof Date ? raw.createdAt : new Date(raw.createdAt ?? Date.now()),
      upvotes: typeof raw.upvotes === 'number' ? raw.upvotes : 0,
      hasUpvoted,
      text: raw.text || '',
      startupId: raw.startupId || '',
      parentId: raw.parentId || undefined,
      editedAt: raw.editedAt ? new Date(raw.editedAt) : undefined,
    };
  }
  return {
    comments: commentsToReturn.map((comment) => {
      const authorObj = authors.find((a) => a._id.toString() === comment.author?.toString());
      return mapComment(comment as RawComment, authorObj as RawAuthor);
    }),
    hasMore,
  };
}

type AggregatedStartup = RawStartup & { authorDetails: RawAuthor };

export async function getFeaturedStartups(
  slugs: string[]
): Promise<import('@/lib/models').Startup[]> {
  const db = await getDb();
  const editorPosts = (await db
    .collection('startups')
    .aggregate([
      { $match: { slug: { $in: slugs } } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'authors',
          localField: 'author',
          foreignField: '_id',
          as: 'authorDetails',
        },
      },
      { $unwind: '$authorDetails' },
    ])
    .toArray()) as AggregatedStartup[];
  return editorPosts.map((post) => mapStartup(post, post.authorDetails));
}

export async function getUserLikedStartup(startupId: string, username: string): Promise<boolean> {
  const db = await getDb();
  const author = await db.collection('authors').findOne({ username });
  if (!author || !author._id) return false;
  const userObjectId = new ObjectId(author._id);
  const startup = await db.collection('startups').findOne(
    {
      _id: new ObjectId(startupId),
      userLikes: { $elemMatch: { $eq: userObjectId } },
    },
    { projection: { _id: 1 } }
  );
  return !!startup;
}

export async function getStartupsLikedByUser(username: string) {
  const db = await getDb();
  const author = await db.collection('authors').findOne({ username });
  if (!author || !author._id) return [];
  const userObjectId = new ObjectId(author._id);
  const startups = await db
    .collection('startups')
    .find({ userLikes: userObjectId })
    .sort({ createdAt: -1 })
    .toArray();
  // Fetch all authors for mapping
  const allAuthorIds = [...new Set(startups.map((startup) => startup.author?.toString()))]
    .filter(Boolean)
    .map((id) => new ObjectId(id));
  const authors = allAuthorIds.length
    ? await db
        .collection('authors')
        .find({ _id: { $in: allAuthorIds } })
        .toArray()
    : [];
  return startups
    .filter((startup) => {
      const authorObj = authors.find(
        (author) => author._id.toString() === startup.author?.toString()
      );
      return !!authorObj;
    })
    .map((startup) => {
      const authorObj = authors.find(
        (author) => author._id.toString() === startup.author?.toString()
      );
      return mapStartup(startup as RawStartup, authorObj as RawAuthor);
    });
}

export async function getMostViewedStartupThisWeek() {
  const db = await getDb();
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const agg = await db
    .collection('startup_views')
    .aggregate([
      {
        $match: {
          lastViewed: { $gte: weekStart, $lte: weekEnd },
        },
      },
      {
        $group: {
          _id: '$startupId',
          viewsThisWeek: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'startups',
          localField: '_id',
          foreignField: '_id',
          as: 'startup',
        },
      },
      { $unwind: '$startup' },
      {
        $addFields: {
          totalViews: '$startup.views',
        },
      },
      {
        $sort: {
          viewsThisWeek: -1,
          totalViews: -1,
        },
      },
      { $limit: 1 },
    ])
    .toArray();

  if (!agg.length) return null;

  const startup = agg[0].startup;
  const author = await db.collection('authors').findOne({ _id: startup.author });
  if (!author) return null;

  return {
    ...startup,
    viewsThisWeek: agg[0].viewsThisWeek,
    author,
  };
}
