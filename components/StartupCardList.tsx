import Link from 'next/link';
import Image from 'next/image';
import { formatDate, getAuthorImage, getStartupImage } from '@/lib/utils';
import View from './View';
import type { Startup } from '@/lib/models';

function StartupCardList({ posts }: { posts: Startup[] }) {
  return (
    <ul className="flex flex-col">
      {posts.map((post) => {
        const createdAtStr =
          typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString();
        return (
          <li key={post._id} className="startup-card-list-item">
            <Link href={`/startup/${post.slug}`} className="relative h-14 w-20 flex-shrink-0">
              <Image
                src={getStartupImage(post)}
                alt="startup image"
                fill
                className="startup-image rounded-md"
                sizes="80px"
              />
            </Link>
            <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
              <Link href={`/startup/${post.slug}`}>
                <h3 className="card-title truncate text-base" title={post.title}>
                  {post.title}
                </h3>
              </Link>
              <div className="card-metadata">
                <Link
                  href={`/user/${post.author.username}`}
                  className="flex items-center gap-1 hover:underline"
                >
                  <Image
                    src={getAuthorImage(post.author)}
                    alt="author image"
                    width={16}
                    height={16}
                    className="avatar h-4 w-4"
                  />
                  <span className="text-xs">{post.author.name}</span>
                </Link>
                <span className="text-xs">{formatDate(createdAtStr)}</span>
                <View views={post.views} />
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
