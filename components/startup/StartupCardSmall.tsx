import Link from 'next/link';
import Image from 'next/image';

import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDate, getAuthorImage, getStartupImage } from '@/lib/utils';
import View from '@/components/metrics/View';
import type { Startup } from '@/lib/models';
import { ProfilePicture } from '@/components/ImageUtilities';

function StartupCardSmall({ post }: { post: Startup }) {
  const createdAtStr =
    typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString();
  return (
    <li className="startup-card-small">
      <Link
        href={`/startup/${post.slug}`}
        className="relative block aspect-[16/10] w-full overflow-hidden rounded-md"
      >
        <Image
          src={getStartupImage(post)}
          alt="startup image"
          fill
          className="startup-image"
          style={{ objectPosition: 'center top' }}
          sizes="(max-width: 600px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
      </Link>
      <div className="card-metadata mt-1 flex items-center justify-between gap-1 px-0.5">
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <span className="truncate text-xs">{formatDate(createdAtStr)}</span>
          <View views={post.views} />
        </div>
        <Link href={`/user/${post.author.username}`} className="flex-shrink-0">
          <ProfilePicture
            src={getAuthorImage(post.author)}
            alt={`${post.author.username}'s avatar`}
            width={28}
            height={28}
          />
        </Link>
      </div>
      <Link href={`/startup/${post.slug}`} className="block px-0.5 pb-1">
        <p className="card-title line-clamp-2 text-sm" title={post.title}>
          {post.title}
        </p>
      </Link>
    </li>
  );
}

export default StartupCardSmall;

export const StartupCardSmallSkeleton = () => {
  return (
    <>
      {[0, 1, 2, 3, 4].map((index: number) => (
        <li key={cn('skeleton-small', index)} className="startup-card-small space-y-1.5 p-2">
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
