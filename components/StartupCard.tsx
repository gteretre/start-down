import { cn, formatDate, getAuthorImage, getStartupImage } from '@/lib/utils'; // Import utils
import Link from 'next/link';
import Image from 'next/image';
import View from '@/components/View';
import Tooltip from './Tooltip';
import { Skeleton } from './ui/skeleton';
import type { Startup } from '@/lib/models';

const StartupCard: React.FC<{ post: Startup }> = ({ post }) => {
  const createdAtStr =
    typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString();
  return (
    <li className="startup-card flex select-none flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <Link href={`/startup/${post._id}`} className="flex min-w-0 flex-1 items-center gap-4">
          <p className="truncate">{formatDate(createdAtStr)}</p>
          <View views={post.views} />
        </Link>
        <Tooltip text={`${post.author.name}'s Profile`}>
          <Link href={`/user/${post.author.username}`} className="flex-shrink-0">
            <Image
              src={getAuthorImage(post.author)}
              alt="profile picture"
              width={48}
              height={48}
              className="avatar"
            />
          </Link>
        </Tooltip>
      </div>

      <Link
        className="mb-1 flex h-[2.8em] items-center justify-center"
        href={`/startup/${post._id}`}
      >
        <p
          className={
            'overflow-hidden break-words text-left font-bold ' +
            (post.title.length <= 25 ? 'text-2xl' : post.title.length <= 40 ? 'text-xl' : 'text-md')
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
        <p className="text-sm text-gray-500">
          created by <strong>{post.author.name}</strong>
        </p>
      </Link>
      <Link className="flex flex-col" href={`/startup/${post._id}`}>
        <div className="flex min-h-[300px] flex-col justify-between">
          <p className="mb-4 line-clamp-3 min-h-[5em] text-justify">{post.description}</p>
          <div className="relative aspect-[3/2] w-full flex-shrink-0 rounded-3xl bg-gray-100">
            <Image
              src={getStartupImage(post)}
              alt="startup image"
              fill
              className="startup-image object-cover ring-2"
              style={{ objectPosition: 'center top' }}
              sizes="(max-width: 600px) 100vw, 600px"
            />
          </div>
        </div>
      </Link>
      <div className="mt-2 flex w-full justify-between">
        <Link href={`/?query=${post.category}`}>
          <p className="category">{post.category}</p>
        </Link>
        <Link href={`/startup/${post._id}`}>
          <button className="search-btn p-2">More...</button>
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
        <li key={cn('skeleton', index)}>
          <Skeleton className="h-4 w-1/2" />
        </li>
      ))}
    </>
  );
};
