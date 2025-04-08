import React from "react";
import { STARTUPS_BY_AUTHOR_QUERY } from "@/lib/queries";
import { client } from "@/sanity/lib/client";
import StartupCard, { StartupCardType } from "@/components/StartupCard";
import { Squirrel } from "lucide-react";

const UserStartups = async ({ username }: { username: string }) => {
  const editorPosts = await client.fetch(STARTUPS_BY_AUTHOR_QUERY, {
    username
  });

  return editorPosts?.length > 0 ? (
    <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {editorPosts.map((post: StartupCardType, index: number) => (
        <StartupCard key={index} post={post} />
      ))}
    </ul>
  ) : (
    <p>
      <Squirrel />
      No posts yet
    </p>
  );
};

export default UserStartups;
