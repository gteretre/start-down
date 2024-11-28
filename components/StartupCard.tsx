import { formatDate } from "@/lib/utils";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function StartupCard({ post }: StartupCardType) {
  return (
    <li className="startup-card group">
      <div className="flex-between">
        <p className="date">{formatDate(post._createdAt)}</p>
        <div className="top-2 right-2 flex gap-1.5 ">
          <EyeIcon className="size-6 text-primary" />
          <span className="text-16-medium">{post.views}</span>
        </div>
        <div className="flex-between mt-5 gap-5">
          <div className="flex-1">
            <Link href={`/user/${post.author._id}`}>
              <p className="text-16-medium line-clamp-1">{post.author?.name}</p>
            </Link>
            <Link href={`/startup/${post._id}`}>
              <h3 className="text-26-semibold line-clamp-1">{post.title}</h3>
            </Link>
          </div>
          <Link href={`/user/${post.author._id}`}>
            <Image
              src="/logo.png"
              alt="profile picture"
              width={48}
              height={48}
              className="rounded-3xl hover:rounded-lg
              transition-all duration-300 ease-in-out
              ring-2 ring-ring-small"
            ></Image>
          </Link>
          <Link href={`/startup/${post._id}`}>
            <p>{post.description}</p>
            <Image
              src={post.image}
              alt="profile picture"
              width={150}
              height={150}
              className="rounded-3xl hover:rounded-lg
              transition-all duration-300 ease-in-out
              ring-2 ring-ring"
            ></Image>
          </Link>
          <div className="flex-between gap-3 mt-5">
            <Link href={`/category/${post.category}`}>
              <p className="text-16-medium">{post.category}</p>
            </Link>
            <Link href={`/startup/${post._id}`}>
              <button className="btn-pure">Read More...</button>
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

export default StartupCard;
