import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

import { auth } from '@/lib/auth';
import { getAuthorByUsername } from '@/lib/queries';
import Tooltip from '@/components/Tooltip';
import { PenBoxIcon } from 'lucide-react';
import UserStartups from '@/components/UserStartups';
import { StartupCardSkeleton } from '@/components/StartupCard';
import { getAuthorImage } from '@/lib/utils';
import type { Author } from '@/lib/models';

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: username } = await params;
  const session = await auth();
  const fetchedUser = await getAuthorByUsername(username);
  if (!fetchedUser) return notFound();
  const user: Author = fetchedUser;
  const profileOwner = session?.user.username === user.username;

  return (
    <>
      <div className="flex flex-col gap-8 lg:flex-row">
        <section className="w-full lg:w-1/3">
          <div className="blueContainer my-10 mt-10 flex flex-col rounded-lg p-6 shadow-lg lg:sticky lg:top-8 lg:p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {profileOwner ? (
                  <Link href="/settings/profile">
                    <Tooltip text="Edit Profile Picture">
                      <Image
                        src={getAuthorImage(user)}
                        alt={user.username + "'s avatar"}
                        width={120}
                        height={120}
                        className="rounded-full object-cover ring-2 ring-ring"
                      />
                    </Tooltip>
                  </Link>
                ) : (
                  <Image
                    src={getAuthorImage(user)}
                    alt={user.username + "'s avatar"}
                    width={120}
                    height={120}
                    className="rounded-full object-cover ring-2 ring-ring"
                  />
                )}
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

            <p className="mt-4 text-center text-sm">{user.bio}</p>
            <p className="mt-2 text-center text-sm text-gray-500">
              On Start Down since {user.createdAt.toLocaleDateString()}
            </p>
          </div>
        </section>

        <section className="w-full lg:w-2/3">
          <div className="mx-4 mt-4 flex flex-col justify-center rounded-lg p-6 shadow-lg">
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
