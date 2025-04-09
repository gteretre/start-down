import { cn, formatDate } from "@/lib/utils";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import View from "./View";
import Tooltip from "./Tooltip";
import { Skeleton } from "./ui/skeleton";

function StartupCard({ post, key }: any) {
  return (
    <li className="startup-card" key={key}>
      <div>
        <div className="flex justify-between">
          <p>{formatDate(post?._createdAt || new Date())}</p>
          <div className="flex gap-1">
            <EyeIcon className="size-6 text-primary" />
            <span className="text-16-medium">
              <View id={post?._id} />
            </span>
          </div>

          <Tooltip
            text={`${post?.author ? post.author.name : "Someone"}'s Profile`}
          >
            <Link href={`/user/${post?.author?.username}`}>
              <Image
                src={
                  post.author?.image?.startsWith("http")
                    ? post.author.image
                    : "/logo.png"
                }
                alt="profile picture"
                width={48}
                height={48}
                className="avatar"
              ></Image>
            </Link>
          </Tooltip>
        </div>

        <div className="flex-between gap-2">
          <div className="flex-1">
            <Link
              className="flex flex-col items-start"
              href={`/startup/${post?._id}`}
            >
              <h1>{post?.title || "ERROR"}</h1>
            </Link>
            <Link
              className="flex flex-col items-end"
              href={`/user/${post?.author?.username}`}
            >
              <p className="mt-2 text-16-medium line-clamp-1">
                created by <strong>{post?.author?.name}</strong>
              </p>
            </Link>
          </div>
          <Link className="flex flex-col" href={`/startup/${post?._id}`}>
            <p className="text-justify mt-3 mb-5 line-clamp-3 min-h-[4.5em]">
              {post?.description}
            </p>
            <div className="flex justify-center">
              <div className="relative w-full h-0 pb-[66.67%] overflow-hidden">
                <Image
                  src={
                    post?.image && post.image.startsWith("http")
                      ? post.image
                      : `https://placehold.co/600x400?text=${encodeURIComponent(post?.title || "Startup")}`
                  }
                  alt="startup image"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-3xl ease-in-out"
                />
              </div>
            </div>
          </Link>
          <div className="flex justify-between mt-5">
            <Link href={`/?query=${post?.category}`}>
              <p className="category">
                {post?.category || "something went wrong"}
              </p>
            </Link>
            <Link href={`/startup/${post?._id}`}>
              <button className="p-2 search-btn">More...</button>
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

type StartupCardType = {
  _id: string;
  title: string;
  slug: { current: string };
  createAt: string;
  author: { _id: string; name: string; image: string; bio: string };
  views: number;
  description: string;
  category: string;
  image: string;
};

export default StartupCard;
export type { StartupCardType };

export const StartupCardSkeleton = () => {
  return (
    <>
      {[0, 1, 2, 3, 4].map((index: number) => (
        <li key={cn("skeleton", index)}>
          <Skeleton className="h-4 w-1/2" />
        </li>
      ))}
    </>
  );
};
