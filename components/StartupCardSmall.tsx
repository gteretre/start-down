import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import View from '@/components/View';
import { Skeleton } from './ui/skeleton';
import type { Author } from '@/lib/models';

function StartupCardSmall({ post }: { post: StartupCardType }) {
  const createdAtStr =
    typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString();
  return (
    <li
      className="startup-card flex max-h-[325px] min-h-[250px] min-w-[150px] max-w-[250px] select-none flex-col gap-1 p-3"
      style={{ fontSize: '0.8rem', borderRadius: '11px' }}
    >
      <div className="flex items-center justify-between gap-2">
        <Link href={`/startup/${post._id}`} className="flex min-w-0 flex-1 items-center gap-2">
          <p className="truncate text-xs">{formatDate(createdAtStr)}</p>
          <View id={post._id} initialViews={post.views} />
        </Link>
        <Link href={`/user/${post.author.username}`} className="flex-shrink-0">
          <Image
            src={
              post.author.image?.startsWith('http') || post.author.image?.startsWith('/')
                ? post.author.image
                : '/logo.png'
            }
            alt="profile picture"
            width={24}
            height={24}
            className="avatar"
            style={{
              maxHeight: 24,
              minHeight: 6,
              minWidth: 6,
              maxWidth: 24,
              borderRadius: '12px',
            }}
          />
        </Link>
      </div>

      <Link
        className="mb-0.5 flex h-[1.4em] items-center justify-center"
        href={`/startup/${post._id}`}
      >
        <p
          className={
            'overflow-hidden break-words text-center font-bold ' +
            (post.title.length <= 25
              ? 'text-base'
              : post.title.length <= 40
                ? 'text-sm'
                : 'text-xs')
          }
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            hyphens: 'auto',
            WebkitHyphens: 'auto',
            msHyphens: 'auto',
            wordBreak: 'break-word',
            maxWidth: '100%',
          }}
          title={post.title}
        >
          {post.title}
        </p>
      </Link>
      <Link className="flex flex-col items-end" href={`/user/${post.author.username}`}>
        <p className="text-[10px] text-gray-500">
          created by <strong>{post.author.name}</strong>
        </p>
      </Link>
      <Link className="flex flex-col" href={`/startup/${post._id}`}>
        <div className="flex min-h-[150px] flex-col justify-between" style={{ minHeight: 150 }}>
          <p className="mb-2 line-clamp-3 min-h-[2.5em] text-justify text-xs">{post.description}</p>
          <div
            className="relative aspect-[3/2] w-full flex-shrink-0 rounded-xl bg-gray-100"
            style={{ minHeight: 60 }}
          >
            <Image
              src={
                post.image?.startsWith('http') || post.image?.startsWith('/')
                  ? post.image
                  : `https://placehold.co/300x200?text=${encodeURIComponent(post.title)}`
              }
              alt="startup image"
              fill
              className="startup-image object-cover ring-2"
              style={{ objectPosition: 'center top', borderRadius: '12px' }}
              sizes="(max-width: 300px) 100vw, 300px"
            />
          </div>
        </div>
      </Link>
      <div className="mt-1 flex w-full justify-between">
        <Link href={`/?query=${post.category}`}>
          <p className="category text-xs">{post.category}</p>
        </Link>
        <Link href={`/startup/${post._id}`}>
          <button className="search-btn p-1 text-xs">More...</button>
        </Link>
      </div>
    </li>
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
export default StartupCardSmall;
export type { StartupCardType };

export const StartupCardSmallSkeleton = () => {
  return (
    <>
      {[0, 1, 2, 3, 4].map((index: number) => (
        <li key={cn('skeleton-small', index)}>
          <Skeleton className="h-2 w-1/4" />
        </li>
      ))}
    </>
  );
};
