import { formatDate, formatNumber } from "@/lib/utils";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function StartupCard({ post }: any) {
  console.log(post.category);
  return (
    <li className="startup-card group">
      <div>
        <div className="flex justify-between">
          <p>{formatDate(post._createdAt || new Date())}</p>
          <div className="flex gap-1">
            <EyeIcon className="size-6 text-primary" />
            <span className="text-16-medium">
              {formatNumber(post.views || 1)}
            </span>
          </div>

          <Link href={`/user/${post.author._id}`}>
            <Image
              //problem with sanity, getting 404
              //src={post.author.image ? post.author.image : "/logo.png"}
              src="/logo.png"
              alt="profile picture"
              width={48}
              height={48}
              className="rounded-3xl hover:rounded-lg
              transition-all duration-300 ease-in-out
              ring-2 ring-ring-small min-w-12 min-h-12 
              max-w-48 max-h-48"
            ></Image>
          </Link>
        </div>

        <div className="flex-between gap-2">
          <div className="flex-1">
            <Link
              className="flex flex-col items-start"
              href={`/startup/${post._id}`}
            >
              <h1>{post.title || "ERROR"}</h1>
            </Link>

            <Link
              className="flex flex-col items-end"
              href={`/user/${post.author._id}`}
            >
              <p className=" mt-2 text-16-medium line-clamp-1">
                created by <strong>{post.author?.name}</strong>
              </p>
            </Link>
          </div>
          <Link className="flex flex-col" href={`/startup/${post._id}`}>
            <p className="text-justify mt-3 mb-5 line-clamp-5">
              {post.description}
            </p>
            <div className="flex justify-center">
              <Image
                src={
                  post.image
                    ? post.image
                    : `https://placehold.co/600x400?text=${post.title}`
                }
                alt="profile picture"
                width={600}
                height={400}
                className="rounded-3xl ease-in-out
              ring-2 ring-ring"
              ></Image>
            </div>
          </Link>
          <div className="flex justify-between mt-5">
            <Link href={`/?query=${post.category}`}>
              <p className="category">
                {post.category || "something went wrong"}
              </p>
            </Link>
            <Link href={`/startup/${post._id}`}>
              <button className="p-2 search-btn">More...</button>
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

export default StartupCard;
