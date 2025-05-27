import Link from 'next/link';
import Image from 'next/image';

import { formatDate, getAuthorImage, getStartupImage } from '@/lib/utils';
import View from '@/components/metrics/View';
import type { Startup } from '@/lib/models';
import { ProfilePicture } from '@/components/ImageUtilities';

function StartupCardList({ posts }: { posts: Startup[] }) {
  return (
    <ul className="flex flex-col">
      {posts.map((post) => {
        const createdAtStr =
          typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString();

        return (
          <li key={post._id} className="startup-card-list-item group">
            <Link
              href={`/startup/${post.slug}`}
              className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-md"
            >
              <Image
                src={getStartupImage(post)}
                alt="startup image"
                fill
                className="startup-image object-cover"
                sizes="100px"
              />
            </Link>
            <div className="flex flex-1 flex-col gap-1 overflow-hidden">
              <Link
                href={`/startup/${post.slug}`}
                className="-m-1 block rounded-md p-1 transition-colors duration-200"
              >
                <h3
                  className="card-title truncate text-base font-semibold transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  title={post.title}
                >
                  {post.title}
                </h3>
                {post.description && (
                  <p
                    className="mt-0.5 line-clamp-2 text-sm text-gray-600 dark:text-gray-300"
                    title={post.title}
                  >
                    {post.description}
                  </p>
                )}
              </Link>

              <div className="card-metadata">
                <View views={post.views} />
                <span className="text-xs">{formatDate(createdAtStr)}</span>
                <Link
                  href={`/user/${post.author.username}`}
                  className="flex items-center gap-1 hover:underline"
                >
                  <ProfilePicture
                    src={getAuthorImage(post.author)}
                    alt={`${post.author.username}'s avatar`}
                    width={28}
                    height={28}
                  />
                  <span className="text-xs">{post.author.name}</span>
                </Link>

                <Link href={`/?query=${post.category}`} className="card-category ml-auto pl-2">
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
