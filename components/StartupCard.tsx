import Link from 'next/link';
import Image from 'next/image';

import { cn, formatDate, getAuthorImage, getStartupImage } from '@/lib/utils';
import View from '@/components/View';
import Tooltip from './Tooltip';
import { Skeleton } from './ui/skeleton';
import type { Startup } from '@/lib/models';
import { ProfilePicture } from './ImageUtilities';

const StartupCard: React.FC<{ post: Startup }> = ({ post }) => {
  const createdAtStr =
    typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString();
  return (
    <li className="startup-card">
      <div className="flex items-center justify-between gap-2">
        <div className="card-metadata flex-1">
          <span>{formatDate(createdAtStr)}</span>
          <View views={post.views} />
        </div>
        <Tooltip text={`${post.author.name}'s Profile`}>
          <Link href={`/user/${post.author.username}`} className="flex-shrink-0">
            <ProfilePicture
              src={getAuthorImage(post.author)}
              alt="profile picture"
              width={42}
              height={42}
            />
          </Link>
        </Tooltip>
      </div>
      <Link href={`/startup/${post.slug}`} className="block">
        <h2 className="card-title line-clamp-2 min-h-11" title={post.title}>
          {post.title}
        </h2>
      </Link>
      <Link href={`/user/${post.author.username}`} className="block">
        <p className="text-xs text-muted-foreground">
          by <strong>{post.author.name}</strong>
        </p>
      </Link>
      <Link href={`/startup/${post.slug}`} className="mt-2 block">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg">
          <Image
            src={getStartupImage(post)}
            alt="startup image"
            fill
            className="startup-image"
            style={{ objectPosition: 'center top' }}
            sizes="(max-width: 600px) 90vw, (max-width: 900px) 400px, 450px"
          />
        </div>
      </Link>
      <Link
        href={`/startup/${post.slug}`}
        className="card-description mt-2 line-clamp-3 min-h-[4.5em]"
      >
        {post.description}
      </Link>
      <div className="mt-auto flex items-end justify-between pt-2">
        <Link href={`/?query=${post.category}`}>
          <span className="card-category">{post.category}</span>
        </Link>
        <Link href={`/startup/${post.slug}`} className="card-more-link">
          More...
        </Link>
      </div>
    </li>
  );
};

export default StartupCard;

export const StartupCardSkeleton = () => {
  return (
    <>
      {[0, 1, 2, 3, 4].map((index: number) => (
        <li key={cn('skeleton-card', index)} className="startup-card space-y-3 p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-11 w-4/5" />
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-2 aspect-[16/10] w-full rounded-lg" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/6" />
          </div>
        </li>
      ))}
    </>
  );
};
