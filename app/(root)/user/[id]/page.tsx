import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { auth } from "@/auth";
import { AUTHOR_BY_USERNAME_QUERY } from "@/lib/queries";
import { mongoFetch } from "@/lib/live";
import Tooltip from "@/components/Tooltip";
import { PenBoxIcon } from "lucide-react";
import UserStartups from "@/components/UserStartups";
import { Suspense } from "react";
import { StartupCardSkeleton } from "@/components/StartupCard";

export const experimental_ppr = true;

const Page = async ({ params }: { params: { id: string } }) => {
  const username = params.id;
  const session = await auth();

  // Fetch user data using mongoFetch instead of Sanity client
  const { data: user } = await mongoFetch({
    query: AUTHOR_BY_USERNAME_QUERY,
    params: { username }
  });

  if (!user) {
    return notFound();
  }

  const profileOwner = session?.user?.username === user.username;

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8">
        <section className="w-full lg:w-1/3">
          <div className="blueContainer flex flex-col my-10 mt-10 p-6 rounded-lg shadow-lg lg:sticky lg:top-8 lg:p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {profileOwner ? (
                  <Link href="/settings/profile">
                    <Tooltip text="Edit Profile Picture">
                      <Image
                        src={
                          user.image && user.image.startsWith("http")
                            ? user.image
                            : "/logo.png"
                        }
                        alt={user.username + "'s avatar"}
                        width={120}
                        height={120}
                        className="rounded-full ring-4 ring-ring object-cover"
                      />
                    </Tooltip>
                  </Link>
                ) : (
                  <Image
                    src={
                      user.image && user.image.startsWith("http")
                        ? user.image
                        : "/logo.png"
                    }
                    alt={user.username + "'s avatar"}
                    width={120}
                    height={120}
                    className="rounded-full ring-4 ring-ring object-cover"
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

            <p className="text-sm text-center mt-4">{user.bio}</p>
            <p className="text-sm text-center mt-2 text-gray-500">
              On Start Down since {user.createdAt.toLocaleDateString()}
            </p>
          </div>
        </section>

        <section className="w-full lg:w-2/3">
          <div className="flex flex-col justify-center mx-4 mt-4 p-6 rounded-lg shadow-lg">
            <p className="text-2xl font-semibold text-center mb-6">
              {profileOwner ? "Your Startups" : `${user.name}'s Startups`}
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
