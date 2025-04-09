import "server-only";
import { cache } from "react";
import {
  getStartups,
  getStartupById,
  getStartupsByAuthor,
  updateStartupViews,
  getAuthorByUsername
} from "./mongodb-service";

// Create a cached version of the MongoDB queries to provide similar functionality
// to what we had with Sanity's live queries
export const mongoFetch = cache(
  async ({ query, params }: { query: string; params?: any }) => {
    // Map query identifiers to MongoDB service functions
    if (query.includes("startup") && query.includes("author")) {
      const { username } = params || {};
      const data = await getStartupsByAuthor(username);
      return { data };
    } else if (query.includes("startup") && params?.id) {
      const data = await getStartupById(params.id);
      return { data };
    } else if (query.includes("startup")) {
      const data = await getStartups(params?.search);
      return { data };
    } else if (query.includes("views") && params?.id) {
      await updateStartupViews(params.id);
      const startup = await getStartupById(params.id);
      return { data: { views: startup?.views || 0 } };
    } else if (query.includes("author.byUsername")) {
      const { username } = params || {};
      const data = await getAuthorByUsername(username);
      return { data };
    }

    // Default empty response
    return { data: [] };
  }
);

// Stub component to maintain API compatibility with previous code
export function SanityLive() {
  return null;
}
