import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import { getStartupBySlug } from '@/lib/queries';
import { formatDate, formatDateAgo, getAuthorImage, getStartupImage } from '@/lib/utils';
import ShareButton from '@/components/ShareButton';
import ViewClient from '@/components/ViewClient';
import Tooltip from '@/components/Tooltip';
import FeaturedStartups from '@/components/FeaturedStartups';
import { auth } from '@/lib/auth';
import type { Startup } from '@/lib/models';
import MDRender from '@/mike-mardown/src/rendermd';
import CommentSection from '@/components/CommentSection';

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: slug } = await params;
  const session = await auth();

  const fetchedPost = await getStartupBySlug(slug);
  if (!fetchedPost) return notFound();

  const post: Startup = fetchedPost;
  const createdAtStr =
    typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString();

  return (
    <>
      <section className="mb-8 bg-card p-6 px-10 shadow-sm md:px-20 lg:px-60">
        <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
          <Tooltip text={`Created: ${formatDateAgo(createdAtStr)}`}>
            <span className="cursor-default">{formatDate(createdAtStr)}</span>
          </Tooltip>
          <ViewClient
            id={post._id}
            initialViews={post.views}
            incrementOnMount={true}
            isLoggedIn={!!session}
          />
        </div>
        <h1
          className="mb-3 text-3xl font-bold leading-tight text-foreground md:text-4xl"
          title={post.title}
        >
          {post.title}
        </h1>
        <p className="mb-5 text-base text-muted-foreground md:text-lg">{post.description}</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tooltip text={(post.author.bio || 'Author bio').substring(0, 80)}>
            <Link
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
              href={`/user/${post.author.username}`}
            >
              <Image
                src={getAuthorImage(post.author)}
                alt={post.author.name + 's avatar'}
                width={40}
                height={40}
                className="avatar"
              />
              <div className="text-sm">
                <p className="font-semibold text-foreground">{post.author.name}</p>
                <p className="text-muted-foreground">@{post.author.username}</p>
              </div>
            </Link>
          </Tooltip>
          <div className="flex items-center gap-4">
            <Link href={`/?query=${post.category}#cards-section`}>
              <span className="tag">{post.category}</span>
            </Link>
            <ShareButton title={post.title} text={post.description} url={'/startup/' + post.slug} />
          </div>
        </div>
      </section>

      <section>
        <div className="mx-6 my-6 flex flex-col items-center justify-center md:mx-12 md:my-12 lg:mx-32 xl:mx-44">
          <Image
            src={getStartupImage(post)}
            width={600}
            height={400}
            alt={post.title}
            className="startup-image mb-8"
          />
          <div className="articleBox">
            {post.pitch ? <MDRender markdown={post.pitch} /> : <p>Something went wrong...</p>}
          </div>
        </div>
      </section>
      <hr />

      <section className="">
        <div className="px-5">
          <div className="">
            <FeaturedStartups />
          </div>
        </div>
      </section>
      <hr />

      <section>
        <div className="mb-8 p-6 px-10 md:px-20 lg:px-60">
          <h2 className="text-24-medium">Comments</h2>
          <CommentSection startupId={post._id} user={session?.user} />
        </div>
      </section>
    </>
  );
};

export default Page;
