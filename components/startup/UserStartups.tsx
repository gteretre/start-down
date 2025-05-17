import React from 'react';
import StartupCard from '@/components/startup/StartupCard';
import type { Startup } from '@/lib/models';
import { Squirrel } from 'lucide-react';
import { getStartupsByAuthor } from '@/lib/queries';

const UserStartups = async ({ username, className }: { username: string; className?: string }) => {
  const userSpecificPosts = await getStartupsByAuthor(username);

  return userSpecificPosts?.length > 0 ? (
    <ul className={`mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 ${className}`}>
      {userSpecificPosts.map((post: Startup, index: number) => (
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
