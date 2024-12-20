import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { auth } from "@/auth";
import { AUTHOR_BY_USERNAME_QUERY } from "@/lib/queries";
import { client } from "@/sanity/lib/client";
import Tooltip from "@/components/Tooltip";
import { PenBoxIcon } from "lucide-react";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const username = (await params).id;
  const session = await auth();
  const user = await client.fetch(AUTHOR_BY_USERNAME_QUERY, { username });
  if (!user) {
    return notFound();
  }
  const profileOwner = session?.user.id === user.id;

  return (
    <>
      <div className="flex flex-col lg:flex-row">
        <section className="">
          <div className="blueContainer flex flex-col m-10">
            <div className="max-w-[1000px] mx-auto flex justify-between gap-2 my-4">
              <div className="mx-4">
                {profileOwner ? (
                  <Link href="/settings/profile">
                    <Tooltip text="Edit Profile Picture">
                      <Image
                        src="/logo.png"
                        alt={user.username + "s avatar"}
                        width={120}
                        height={120}
                        className="rounded-full ring-4 ring-ring object-cover"
                      />
                    </Tooltip>
                  </Link>
                ) : (
                  <Image
                    src="/logo.png"
                    alt={user.username + "s avatar"}
                    width={120}
                    height={120}
                    className="rounded-full ring-4 ring-ring object-cover"
                  />
                )}
              </div>

              <div className="mx-4">
                {profileOwner && (
                  <div className="relative">
                    <Link
                      className="absolute top-0 right-0 m-2"
                      href="/settings/profile"
                    >
                      <Tooltip text="Edit Profile">
                        <PenBoxIcon />
                      </Tooltip>
                    </Link>
                  </div>
                )}
                <div className="textBox h-fill">
                  <h3 className="text-2xl font-bold">{user.name}</h3>
                  <h4 className="">@{user.username}</h4>
                </div>
              </div>
            </div>
            <p className="text-sm">{user.bio}</p>
          </div>
        </section>
        <section>
          <div className="flex flex-col justify-center">
            <p className="text-30-semibold text-center">
              {profileOwner ? "Your Startups" : "All Startups"}
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default Page;
