import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";

// Define types for our MongoDB documents
export interface Author {
  _id?: string;
  id: string;
  name: string;
  username: string;
  email: string;
  image?: string;
  bio?: string;
}

export interface Startup {
  _id?: string;
  title: string;
  slug: {
    current: string;
  };
  createdAt: Date;
  author: string | ObjectId; // Reference to Author document
  views?: number;
  description: string;
  category: string;
  image?: string;
  pitch: string;
}

// Startup related functions
export async function createStartup(
  startup: Omit<Startup, "_id" | "createdAt">
) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database connection failed");
    }

    // Validate required fields
    if (!startup.title || !startup.description || !startup.author) {
      throw new Error("Missing required fields for startup");
    }

    // Make sure author field is an ObjectId
    let authorObjectId;
    try {
      authorObjectId =
        typeof startup.author === "string"
          ? new ObjectId(startup.author)
          : startup.author;
    } catch (error) {
      throw new Error("Invalid author ID format");
    }

    // Create the document with proper ObjectId
    const startupDoc = {
      ...startup,
      author: authorObjectId,
      createdAt: new Date(),
      views: 0
    };

    const result = await db.collection("startups").insertOne(startupDoc);

    if (!result || !result.insertedId) {
      throw new Error("Failed to insert startup into database");
    }

    // Return the created startup with its new ID
    return {
      _id: result.insertedId.toString(),
      ...startup,
      createdAt: new Date(),
      views: 0
    };
  } catch (error) {
    throw error;
  }
}

export async function getStartupById(id: string) {
  const db = await getDb();
  const startup = await db
    .collection("startups")
    .findOne({ _id: new ObjectId(id) });

  if (startup) {
    // Fetch the author information
    const author = await db
      .collection("authors")
      .findOne({ _id: new ObjectId(startup.author.toString()) });
    return {
      ...startup,
      _id: startup._id.toString(),
      author
    };
  }

  return null;
}

export async function getStartups(search?: string) {
  const db = await getDb();
  let query = {};

  if (search) {
    query = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ]
    };
  }

  const startups = await db
    .collection("startups")
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  // Get all unique author IDs from startups
  const authorIds = [
    ...new Set(startups.map((startup) => startup.author?.toString()))
  ]
    .filter(Boolean)
    .map((id) => new ObjectId(id));

  // Fetch all authors in one query
  const authors = authorIds.length
    ? await db
        .collection("authors")
        .find({ _id: { $in: authorIds } })
        .toArray()
    : [];

  // Map author data to each startup
  return startups.map((startup) => ({
    ...startup,
    _id: startup._id.toString(),
    author:
      authors.find(
        (author) => author._id.toString() === startup.author?.toString()
      ) || null
  }));
}

export async function getStartupsByAuthor(username: string) {
  const db = await getDb();

  // First find the author
  const author = await db.collection("authors").findOne({ username });
  if (!author) return [];

  // Then find startups by that author
  const startups = await db
    .collection("startups")
    .find({ author: new ObjectId(author._id) })
    .sort({ createdAt: -1 })
    .toArray();

  return startups.map((startup) => ({
    ...startup,
    _id: startup._id.toString(),
    author
  }));
}

export async function updateStartupViews(id: string) {
  const db = await getDb();
  const result = await db
    .collection("startups")
    .updateOne({ _id: new ObjectId(id) }, { $inc: { views: 1 } });

  return result.modifiedCount > 0;
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
    return 0;
  }
}

// Author related functions
export async function createAuthor(author: Omit<Author, "_id">) {
  const db = await getDb();
  // Ensure 'id' is present (OAuth provider ID or generated)
  const authorData = {
    ...author,
    createdAt: new Date()
  };
  const result = await db.collection("authors").insertOne(authorData);

  return {
    _id: result.insertedId.toString(),
    ...authorData
  };
}

export async function getAuthorById(id: string) {
  const db = await getDb();
  try {
    // Try to find by 'id' (OAuth provider ID)
    let author = await db.collection("authors").findOne({ id });
    // If not found, try by MongoDB _id
    if (!author && ObjectId.isValid(id)) {
      author = await db
        .collection("authors")
        .findOne({ _id: new ObjectId(id) });
    }
    return author ? { ...author, _id: author._id.toString() } : null;
  } catch (error) {
    console.error("Error in getAuthorById:", error);
    return null;
  }
}

export async function getAuthorByEmail(email: string) {
  const db = await getDb();
  const author = await db.collection("authors").findOne({ email });

  return author ? { ...author, _id: author._id.toString() } : null;
}

export async function getAuthorByUsername(username: string) {
  const db = await getDb();
  const author = await db.collection("authors").findOne({ username });

  return author ? { ...author, _id: author._id.toString() } : null;
}
