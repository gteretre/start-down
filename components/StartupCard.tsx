import { formatDate } from "@/lib/utils";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function StartupCard({ post }: any) {
  return (
    <li className="startup-card group">
      <div>
        <div className="flex gap-3 mt-5 items-center">
          <p className="date">{formatDate(post._createdAt || new Date())}</p>

          <Link href={`/user/${post.author._id}`}>
            <Image
              src={post.author.image ? post.author.image : "/logo.png"}
              alt="profile picture"
              width={48}
              height={48}
              className="rounded-3xl hover:rounded-lg
              transition-all duration-300 ease-in-out
              ring-2 ring-ring-small min-w-12 min-h-12 
              max-w-48 max-h-48 m-5"
            ></Image>
          </Link>
        </div>

        <div className="flex gap-1.5 ml-5">
          <EyeIcon className="size-6 text-primary" />
          <span className="text-16-medium">{post.views || "0"}</span>
        </div>

        <div className="flex-between mt-5 gap-5">
          <div className="flex-1">
            <Link href={`/user/${post.author._id}`}>
              <p className="text-16-medium line-clamp-1">{post.author?.name}</p>
            </Link>
            <Link href={`/startup/${post._id}`}>
              <h1>{post.title || "ERROR"}</h1>
            </Link>
          </div>
          <Link href={`/startup/${post._id}`}>
            <p>{post.description}</p>
            <Image
              src={post.image ? post.image : "/logo.png"}
              alt="profile picture"
              layout="responsive"
              width={400}
              height={200}
              className="rounded-3xl hover:rounded-lg
              transition-all duration-300 ease-in-out
              ring-2 ring-ring w-full h-max-[200px]"
              objectFit="cover"
            ></Image>
          </Link>
          <div className="flex gap-1 mt-5 items-center">
            <Link href={`/category/${post.category}`}>
              <p className="text-16-medium">
                {post.category || "something went wrong"}
              </p>
            </Link>
            <Link href={`/startup/${post._id}`}>
              <button className="p-2 m-5 search-btn">Read More</button>
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

export default StartupCard;
