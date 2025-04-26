import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import type { Author } from '@/lib/models';

function StartupCardList({ posts }: { posts: StartupCardType[] }) {
  return (
    <ul className="flex w-full flex-col gap-3">
      {posts.map((post) => {
        const createdAtStr =
          typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString();
        return (
          <li
            key={post._id}
            className="startup-card mx-auto flex w-full max-w-full select-none flex-row items-center gap-2 bg-card px-2 py-1 shadow ring-1 ring-ring"
            style={{ borderRadius: '12px', minHeight: 0, height: '60px' }}
          >
            <Link href={`/startup/${post._id}`} className="flex-shrink-0">
              <div className="relative h-12 w-16 overflow-hidden rounded bg-gray-100">
                <Image
                  src={
                    post.image?.startsWith('http') || post.image?.startsWith('/')
                      ? post.image
                      : `https://placehold.co/128x96?text=${encodeURIComponent(post.title)}`
                  }
                  alt="startup image"
                  fill
                  className="startup-image object-cover"
                  style={{ objectPosition: 'center top', borderRadius: '6px' }}
                  sizes="64px"
                />
              </div>
            </Link>
            <Link
              href={`/startup/${post._id}`}
              className="flex min-w-0 flex-1 flex-row items-center gap-1"
            >
              <div className="min-w-[40ch] max-w-[40ch] truncate text-xs font-bold">
                {post.title}
              </div>
              <span className="max-w-[8ch] truncate text-[9px] text-gray-400 sm:inline">
                {formatDate(createdAtStr)}
              </span>
              {post.views}
              <p className="ml-1 hidden min-w-[20ch] max-w-[20ch] truncate text-[9px] text-gray-500 sm:inline">
                by <strong>{post.author.name}</strong>
              </p>
              <p className="ml-1 flex-1 truncate text-[9px] text-gray-500">{post.description}</p>
              <div className="ml-2 flex flex-row items-center gap-1">
                <span className="category max-w-[14ch] truncate text-[9px]">{post.category}</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

type StartupCardType = {
  _id: string;
  title: string;
  slug: { current: string };
  createdAt: Date | string;
  author: Author;
  views: number;
  description: string;
  category: string;
  image?: string;
};
export default StartupCardList;
export type { StartupCardType };
