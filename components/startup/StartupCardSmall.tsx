import Link from 'next/link';
import Image from 'next/image';

import { Skeleton } from '@/components/ui/skeleton';
import { mergeCssClasses, formatDate, getAuthorImage, getStartupImage } from '@/lib/utils';
import View from '@/components/metrics/View';
import type { Startup } from '@/lib/models';
import { ProfilePicture } from '@/components/ImageUtilities';

function StartupCardSmall({ post }: { post: Startup }) {
  const createdAtStr =
    typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString();
  return (
    <>
      <Link
        href={`/startup/${post.slug}`}
        className="group block h-full cursor-pointer rounded-lg border border-gray-200 bg-card p-3 shadow-sm hover:border-border hover:shadow-lg dark:border-gray-800"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg">
          <Image
            src={getStartupImage(post)}
            alt="startup image"
            fill
            className="startup-image"
            style={{ objectPosition: 'center top' }}
            sizes="(max-width: 600px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        <div className="mt-3">
          <h3
            className="card-title mb-2 line-clamp-2 min-h-[2.5rem] text-base font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
            title={post.title}
          >
            {post.title}
          </h3>
          <div className="card-metadata flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                {formatDate(createdAtStr)}
              </span>
              <View views={post.views} />
            </div>
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/user/${post.author.username}`;
              }}
              className="flex-shrink-0"
            >
              <ProfilePicture
                src={getAuthorImage(post.author)}
                alt={`${post.author.username}'s avatar`}
                width={32}
                height={32}
                className="ring-2 ring-white dark:ring-gray-800"
              />
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}

export default StartupCardSmall;

export const StartupCardSmallSkeleton = () => {
  return (
    <>
      {[0, 1, 2, 3, 4].map((index: number) => (
        <li
          key={mergeCssClasses('skeleton-small', index)}
          className="startup-card-small space-y-1.5 p-2"
        >
          <Skeleton className="aspect-[16/10] w-full rounded-md" />
          <div className="flex items-center justify-between px-0.5">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <Skeleton className="h-4 w-4/5 px-0.5" />
        </li>
      ))}
    </>
  );
};
