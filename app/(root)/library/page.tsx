import React from 'react';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { auth } from '@/lib/auth';
import { StartupCardSkeleton } from '@/components/startup/StartupCard';
import UserStartups from '@/components/startup/UserStartups';
import StartupCardList from '@/components/startup/StartupCardList';
import { getStartupsLikedByUser } from '@/lib/queries';

const Page = async () => {
  const session = await auth();
  if (!session || !session.user || !session.user.username) {
    return notFound();
  }
  const user = session.user;
  const likedStartups = await getStartupsLikedByUser(user.username!);

  return (
    <section className="flex-1 px-8 pb-8 md:px-16 lg:px-24">
      <div className="mx-auto flex flex-col rounded-3xl p-8">
        <p className="mb-6 text-center text-2xl font-semibold">Startups followed by You</p>
        {likedStartups.length > 0 ? (
          <StartupCardList posts={likedStartups} />
        ) : (
          <p className="text-center text-muted-foreground">No followed startups yet</p>
        )}
      </div>
      <p className="mb-6 text-center text-2xl font-semibold">Your own Startups</p>
      <Suspense fallback={<StartupCardSkeleton />}>
        <UserStartups username={user.username!} className="max-h-xl max-w-2xl" />
      </Suspense>
    </section>
  );
};

export default Page;
