import Link from 'next/link';
import Image from 'next/image';
import { formatDate, getAuthorImage, getStartupImage } from '@/lib/utils';
import View from './View';
import type { Startup } from '@/lib/models';

function StartupCardList({ posts }: { posts: Startup[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {posts.map((post) => {
        const createdAtStr =
          typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString();
        return (
          <li
            key={post._id}
            className="startup-card-list-item flex items-center gap-4 border-b pb-4"
          >
            <Link href={`/startup/${post._id}`} className="relative h-16 w-24 flex-shrink-0">
              <Image
                src={getStartupImage(post)}
                alt="startup image"
                fill
                className="rounded object-cover ring-1"
                sizes="100px"
              />
            </Link>
            <div className="flex flex-1 flex-col gap-1 overflow-hidden">
              <Link href={`/startup/${post._id}`}>
                <h3 className="truncate text-lg font-semibold" title={post.title}>
                  {post.title}
                </h3>
              </Link>
              <p className="line-clamp-2 text-sm text-gray-600">{post.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <Link href={`/user/${post.author.username}`} className="flex items-center gap-1">
                  <Image
                    src={getAuthorImage(post.author)}
                    alt="author image"
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                  <span>{post.author.name}</span>
                </Link>
                <span>{formatDate(createdAtStr)}</span>
                <View views={post.views} />
                <Link href={`/?query=${post.category}`} className="ml-auto capitalize">
                  {post.category}
                </Link>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default StartupCardList;
