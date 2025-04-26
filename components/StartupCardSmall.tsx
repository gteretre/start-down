import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from './ui/skeleton';
import { cn, formatDate, getAuthorImage, getStartupImage } from '@/lib/utils';
import View from './View';
import type { Startup } from '@/lib/models';

function StartupCardSmall({ post }: { post: Startup }) {
  const createdAtStr =
    typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString();
  return (
    <li className="startup-card-small flex select-none flex-col gap-1">
      <Link href={`/startup/${post._id}`} className="relative aspect-[3/2] w-full rounded-lg">
        <Image
          src={getStartupImage(post)}
          alt="startup image"
          fill
          className="startup-image object-cover ring-2"
          style={{ objectPosition: 'center top' }}
          sizes="(max-width: 600px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
      </Link>
      <div className="flex items-center justify-between gap-1">
        <Link href={`/startup/${post._id}`} className="flex min-w-0 flex-1 items-center gap-1">
          <p className="truncate text-xs">{formatDate(createdAtStr)}</p>
          <View views={post.views} />
        </Link>
        <Link href={`/user/${post.author.username}`} className="flex-shrink-0">
          <Image
            src={getAuthorImage(post.author)}
            alt="profile picture"
            width={12}
            height={12}
            className="avatar"
          />
        </Link>
      </div>
      <Link href={`/startup/${post._id}`}>
        <p className="line-clamp-2 text-sm font-semibold" title={post.title}>
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
        <li key={cn('skeleton-small', index)}>
          <Skeleton className="h-2 w-1/4" />
        </li>
      ))}
    </>
  );
};
