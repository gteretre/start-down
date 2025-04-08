import React from "react";
import { client } from "@/sanity/lib/client";

import {
  PLAYLIST_BY_SLUG_QUERY,
  STARTUP_BY_ID,
  STARTUPS_BY_AUTHOR_QUERY
} from "@/lib/queries";
import { StartupCardType } from "./StartupCard";
import StartupCard from "./StartupCard";

const FeaturedStartups = async () => {
  const editorPosts = await client.fetch(STARTUPS_BY_AUTHOR_QUERY, {
    username: "creator"
  });

  // const [post, editorPosts] = await Promise.all([client.fetch(STARTUP_BY_ID, {id: "some-id"}), client.fetch(PLAYLIST_BY_SLUG_QUERY, {slug: "test"})]);

  return editorPosts?.length > 0 ? (
    <div className="max-w-4xl mx-auto">
      <p className="text-30-semibold">Editor Picks ({editorPosts.length})</p>
      <ul className="my-8 mx-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {editorPosts.map((post: StartupCardType, index: number) => (
          <StartupCard key={index} post={post} />
        ))}
      </ul>
    </div>
  ) : (
    <p>Something went wrong...</p>
  );
};

export default FeaturedStartups;
