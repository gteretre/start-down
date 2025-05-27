import Link from 'next/link';
import Image from 'next/image';

import { mergeCssClasses, formatDate, getAuthorImage, getStartupImage } from '@/lib/utils';
import View from '@/components/metrics/View';
import { Skeleton } from '@/components/ui/skeleton';
import type { Startup } from '@/lib/models';
import { ProfilePicture } from '@/components/ImageUtilities';

const StartupCard: React.FC<{ post: Startup }> = ({ post }) => {
  const createdAtStr =
    typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString();
  return (
    <div className="group rounded-xl border border-border/50 bg-card p-5 transition-all duration-200 hover:border-border hover:shadow-lg">
      <Link href={`/startup/${post.slug}`} className="block">
        <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden rounded-lg">
          <Image
            src={getStartupImage(post)}
            alt="startup image"
            fill
            className="startup-image"
            style={{ objectPosition: 'center top' }}
            sizes="(max-width: 600px) 90vw, (max-width: 900px) 400px, 450px"
          />
        </div>
        <h2
          className="mb-2 line-clamp-2 min-h-12 text-lg font-semibold leading-6 text-foreground transition-colors group-hover:text-primary"
          title={post.title}
        >
          {post.title}
        </h2>
        <p className="mb-4 line-clamp-2 min-h-10 text-sm text-muted-foreground">
          {post.description}
        </p>
      </Link>
      <div className="mb-3 flex items-center justify-between">
        <Link
          href={`/user/${post.author.username}`}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <ProfilePicture
            src={getAuthorImage(post.author)}
            alt="profile picture"
            width={32}
            height={32}
            className="rounded-full border border-border/20"
          />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground">{post.author.name}</span>
            <span className="text-xs text-muted-foreground">{formatDate(createdAtStr)}</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <View views={post.views} />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border/30 pt-3">
        <Link
          href={`/?query=${post.category}`}
          className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
        >
          {post.category}
        </Link>
        <Link
          href={`/startup/${post.slug}`}
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Read more →
        </Link>
      </div>
    </div>
  );
};

export default StartupCard;

export const StartupCardSkeleton = () => {
  return (
    <>
      {[0, 1, 2, 3, 4].map((index: number) => (
        <li
          key={mergeCssClasses('skeleton-card', index)}
          className="space-y-4 rounded-xl border border-border/50 bg-card p-5"
        >
          <Skeleton className="aspect-[16/10] w-full rounded-lg" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            <Skeleton className="h-4 w-8" />
          </div>
          <div className="flex items-center justify-between border-t border-border/30 pt-3">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </li>
      ))}
    </>
  );
};
