import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

import { auth } from '@/lib/auth';
import { getAuthorByUsername } from '@/lib/queries';
import { PenBoxIcon } from 'lucide-react';
import UserStartups from '@/components/UserStartups';
import { StartupCardSkeleton } from '@/components/StartupCard';
import type { Author } from '@/lib/models';
import { formatDate } from '@/lib/utils';
import { ProfilePicture } from '@/components/ImageUtilities';

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: username } = await params; //! it has to stay like that also keep the Promise
  const session = await auth();
  const fetchedUser = await getAuthorByUsername(username);
  if (!fetchedUser) return notFound();
  const user: Author = fetchedUser;
  const profileOwner = !!session?.user && session.user.username === user.username;

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 lg:flex-row lg:items-start lg:gap-12">
        <aside className="flex w-full flex-col items-center rounded-3xl bg-card p-8 shadow-lg lg:sticky lg:top-8 lg:w-1/3">
          <div className="flex flex-col items-center gap-4">
            <h1 className="animated-heading mb-2 text-3xl font-extrabold leading-tight tracking-tight text-primary drop-shadow-lg">
              {profileOwner ? 'Your Profile' : `User Profile`}
            </h1>

            <div className="relative">
              <ProfilePicture
                src={user.image || '/logo.png'}
                alt={user.username + "'s avatar"}
                width={120}
                height={120}
                className="avatar"
              />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold">{user.name}</h3>
              <h4 className="text-gray-500">@{user.username}</h4>
            </div>
            {profileOwner && (
              <Link
                className="flex items-center gap-2 text-blue-600 hover:underline"
                href="/settings/profile"
              >
                <PenBoxIcon /> Edit Profile
              </Link>
            )}
          </div>
          <p className="mb-2 text-xl font-medium text-muted-foreground">
            {user.bio || 'No bio provided yet.'}
          </p>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            On Start Down since {formatDate(user.createdAt)}
          </p>
        </aside>

        <section className="flex-1">
          <div className="mx-auto flex flex-col rounded-3xl p-8">
            <p className="mb-6 text-center text-2xl font-semibold">
              {profileOwner ? 'Your Startups' : `${user.name}'s Startups`}
            </p>
            <Suspense fallback={<StartupCardSkeleton />}>
              <UserStartups username={user.username} />
            </Suspense>
          </div>
        </section>
      </div>
    </>
  );
};

export default Page;
