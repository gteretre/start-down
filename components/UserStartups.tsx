import React from "react";
import { STARTUPS_BY_AUTHOR_QUERY } from "@/lib/queries";
import StartupCard, { StartupCardType } from "@/components/StartupCard";
import { Squirrel } from "lucide-react";
import { mongoFetch } from "@/lib/live";

const UserStartups = async ({ username }: { username: string }) => {
  const { data: editorPosts } = await mongoFetch({
    query: STARTUPS_BY_AUTHOR_QUERY,
    params: { username }
  });

  const userSpecificPosts = editorPosts?.filter(
    (post: StartupCardType) => post.author.username === username
  );

  return userSpecificPosts?.length > 0 ? (
    <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {userSpecificPosts.map((post: StartupCardType, index: number) => (
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
