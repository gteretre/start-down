import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import View from '@/components/View';
import Tooltip from './Tooltip';
import { Skeleton } from './ui/skeleton';
import { getStartupViews } from '@/lib/queries';
import type { Author } from '@/lib/models';

async function StartupCard({ post }: { post: StartupCardType }) {
  const views = await getStartupViews(post?._id);
  return (
    <li className="startup-card">
      <div>
        <div className="flex justify-between">
          <p>{formatDate(post?.createdAt || new Date())}</p>
          <View id={post?._id} initialViews={views} />
          <Tooltip text={`${post?.author ? post.author.name : 'Someone'}'s Profile`}>
            <Link href={`/user/${post?.author?.username}`}>
              <Image
                src={
                  post.author?.image?.startsWith('http') || post.author?.image?.startsWith('/')
                    ? post.author.image
                    : '/logo.png'
                }
                alt="profile picture"
                width={48}
                height={48}
                className="avatar"
              ></Image>
            </Link>
          </Tooltip>
        </div>{' '}
        <div className="flex-between mt-3 gap-3">
          <div className="flex-1">
            <Link className="flex flex-col items-start" href={`/startup/${post?._id}`}>
              <h1 className="mb-1">{post?.title || 'ERROR'}</h1>
            </Link>
            <Link className="flex flex-col items-end" href={`/user/${post?.author?.username}`}>
              <p className="text-sm text-gray-500">
                created by <strong>{post?.author?.name}</strong>
              </p>
            </Link>
          </div>

          <Link className="flex w-full flex-col" href={`/startup/${post?._id}`}>
            <p className="mb-4 line-clamp-3 min-h-[4.5em] text-justify">{post?.description}</p>
            <div className="mb-2 flex justify-center">
              <div className="relative h-0 w-full overflow-hidden pb-[66.67%]">
                <Image
                  src={
                    post.image?.startsWith('http') || post.image?.startsWith('/')
                      ? post.image
                      : `https://placehold.co/600x400?text=${encodeURIComponent(
                          post.title || 'Startup'
                        )}`
                  }
                  alt="startup image"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-3xl ease-in-out"
                />
              </div>
            </div>
          </Link>

          <div className="mt-4 flex w-full justify-between">
            <Link href={`/?query=${post?.category}`}>
              <p className="category">{post?.category || 'something went wrong'}</p>
            </Link>
            <Link href={`/startup/${post?._id}`}>
              <button className="search-btn p-2">More...</button>
            </Link>
          </div>
        </div>
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
export default StartupCard;
export type { StartupCardType };

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
