import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";

// Add query constants to maintain backward compatibility with existing code
export const STARTUPS_QUERY = "startups";
export const STARTUP_BY_ID = "startup.byId";
export const STARTUPS_BY_AUTHOR_QUERY = "startups.byAuthor";
export const AUTHOR_BY_ID_QUERY = "author.byId";
export const AUTHOR_BY_EMAIL_QUERY = "author.byEmail";
export const AUTHOR_BY_USERNAME_QUERY = "author.byUsername";
export const STARTUP_VIEWS_QUERY = "startup.views";
export const PLAYLIST_BY_SLUG_QUERY = "playlist.bySlug";

export async function getStartups(search?: string) {
  const db = await getDb();
  const query: any = {
    ...(search && {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ]
    })
  };

  const startups = await db
    .collection("startups")
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  // Get all unique author IDs from startups
  const authorIds = [
    ...new Set(
      startups.map((startup) =>
        startup.author instanceof ObjectId
          ? startup.author
          : new ObjectId(startup.author)
      )
    )
  ];

  // Fetch all authors in one query if there are any startups
  let authors = [];
  if (authorIds.length > 0) {
    authors = await db
      .collection("authors")
      .find({ _id: { $in: authorIds } })
      .toArray();
  }

  // Map author data to each startup
  return startups.map((startup) => ({
    ...startup,
    _id: startup._id.toString(),
    author:
      authors.find((author) =>
        author._id.equals(
          startup.author instanceof ObjectId
            ? startup.author
            : new ObjectId(startup.author)
        )
      ) || null
  }));
}

export async function getStartupsByAuthor(username: string) {
  const db = await getDb();

  // First find the author by username
  const author = await db.collection("authors").findOne({ username });
  if (!author) return [];

  // Find all startups by this author using the author's ID
  const startups = await db
    .collection("startups")
    .find({ author: author._id })
    .sort({ createdAt: -1 })
    .toArray();

  // Include author details with each startup
  return startups.map((startup) => ({
    ...startup,
    _id: startup._id.toString(),
    author
  }));
}

export async function getStartupById(id: string) {
  const db = await getDb();
  try {
    // Find the startup
    const startup = await db.collection("startups").findOne({
      _id: typeof id === "string" ? new ObjectId(id) : id
    });

    if (!startup) return null;

    // Get the author details
    const authorId =
      startup.author instanceof ObjectId
        ? startup.author
        : new ObjectId(startup.author);
    const author = await db.collection("authors").findOne({ _id: authorId });

    // Return the startup with author details included
    return {
      ...startup,
      _id: startup._id.toString(),
      author
    };
  } catch (error) {
    console.error("Error fetching startup by ID:", error);
    return null;
  }
}

export async function getPlaylistBySlug(slug: string) {
  const db = await getDb();
  const playlist = await db
    .collection("playlists")
    .findOne({ "slug.current": slug });

  if (!playlist) return null;

  // Get author information if author field exists
  if (playlist.author) {
    const authorId =
      playlist.author instanceof ObjectId
        ? playlist.author
        : new ObjectId(playlist.author);
    const author = await db.collection("authors").findOne({ _id: authorId });

    return {
      ...playlist,
      _id: playlist._id.toString(),
      author
    };
  }

  return {
    ...playlist,
    _id: playlist._id.toString()
  };
}

export async function getStartupViews(id: string) {
  const db = await getDb();
  try {
    const startup = await db
      .collection("startups")
      .findOne(
        { _id: typeof id === "string" ? new ObjectId(id) : id },
        { projection: { views: 1 } }
      );
    return startup?.views || 0;
  } catch (error) {
    console.error("Error fetching startup views:", error);
    return 0;
  }
}

export async function updateStartupViews(id: string) {
  const db = await getDb();
  try {
    const result = await db
      .collection("startups")
      .updateOne(
        { _id: typeof id === "string" ? new ObjectId(id) : id },
        { $inc: { views: 1 } }
      );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error updating startup views:", error);
    return false;
  }
}

export async function getAuthorById(id: string) {
  const db = await getDb();
  try {
    const author = await db
      .collection("authors")
      .findOne({ _id: id instanceof ObjectId ? id : new ObjectId(id) });

    return author
      ? {
          ...author,
          _id: author._id.toString()
        }
      : null;
  } catch (error) {
    console.error("Error fetching author by ID:", error);
    return null;
  }
}

export async function getAuthorByEmail(email: string) {
  const db = await getDb();
  try {
    const author = await db.collection("authors").findOne({ email });

    return author
      ? {
          ...author,
          _id: author._id.toString()
        }
      : null;
  } catch (error) {
    console.error("Error fetching author by email:", error);
    return null;
  }
}

export async function getAuthorByUsername(username: string) {
  const db = await getDb();
  try {
    const author = await db.collection("authors").findOne({ username });

    return author
      ? {
          ...author,
          _id: author._id.toString()
        }
      : null;
  } catch (error) {
    console.error("Error fetching author by username:", error);
    return null;
  }
}

// Add a function to create an author
export async function createAuthor(authorData: any) {
  const db = await getDb();
  try {
    const result = await db.collection("authors").insertOne({
      ...authorData,
      createdAt: new Date()
    });

    return {
      _id: result.insertedId.toString(),
      ...authorData,
      createdAt: new Date()
    };
  } catch (error) {
    console.error("Error creating author:", error);
    return null;
  }
}
