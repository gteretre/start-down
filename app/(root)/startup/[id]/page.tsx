import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import markdownit from 'markdown-it';
const md = markdownit({ html: true });

import { getStartupById, getStartupViews } from '@/lib/queries';
import { formatDate, formatDateAgo } from '@/lib/utils';
import ShareButton from '@/components/ui/ShareButton';
import ViewClient from '@/components/ViewClient';
import Tooltip from '@/components/Tooltip';
import FeaturedStartups from '@/components/FeaturedStartups';
import { ObjectId } from 'mongodb';
import { auth } from '@/auth';

async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await auth();
  const views = await getStartupViews(id);
  // Check if id is a valid ObjectId before querying DB
  if (!ObjectId.isValid(id)) return notFound();

  const post = await getStartupById(id);
  if (!post) return notFound();
  const parsedContent = md.render(post?.pitch || '');
  // lg:mx-28 my-4 mx-2
  return (
    <>
      <section className="blueContainer flex flex-col px-8 py-4">
        <div className="m-auto max-w-[800px] justify-center">
          <div>
            {' '}
            <div className="mx-6 my-8 flex justify-between gap-20 md:mx-12">
              <Tooltip text={`Created: ${formatDateAgo(post?.createdAt || new Date())}`}>
                <p className="text-start">{formatDate(post?.createdAt || new Date())}</p>
              </Tooltip>
              <ViewClient
                id={id}
                initialViews={views}
                incrementOnMount={true}
                isLoggedIn={!!session}
              />
            </div>{' '}
            <h1 className="textBox">{post?.title}</h1>{' '}
            <div className="mx-8 mt-8 text-start lg:mx-32">
              <div
                className="prose dark:prose-invert prose-headings:font-bold prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4 prose-h1:text-primary/90 prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:text-primary/80 prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2 prose-p:text-base max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: md.render(post?.description || ''),
                }}
              />
            </div>
          </div>
          <div className="author mx-12">
            <Tooltip text={post.author?.bio}>
              <Link className="flex justify-between gap-2" href={`/user/${post.author?.username}`}>
                <Image
                  src={
                    post.author?.image?.startsWith('http') || post.author?.image?.startsWith('/')
                      ? post.author.image
                      : '/logo.png'
                  }
                  alt={post.author?.name + 's avatar'}
                  width={48}
                  height={48}
                  className="avatar"
                />
                <div className="flex flex-col items-start pt-1">
                  <p className="text-24-medium">
                    <strong>{post.author?.name}</strong>
                  </p>
                  <p className="text-16-medium">@{post.author?.username}</p>
                </div>
              </Link>
            </Tooltip>
            <ShareButton
              title={post?.title || 'Default Title'}
              text={post?.description || 'Default Text'}
              url={'/startup/' + post?._id}
            />
          </div>
          <p className="category mx-12 text-end text-sm">{post.category}</p>
        </div>
      </section>

      <section>
        <div className="mx-6 my-6 flex flex-col items-center justify-center md:mx-20 md:my-12 lg:mx-32">
          {' '}
          <Image
            src={
              post.image?.startsWith('http') || post.image?.startsWith('/')
                ? post.image
                : `https://placehold.co/600x400?text=${encodeURIComponent(post.title || 'Startup')}`
            }
            width={600}
            height={400}
            alt={post?.title || 'Startup image'}
            className="mb-8 rounded-xl"
          />
          <div className="articleBox">
            {parsedContent ? (
              <div
                className="max-w-[600px] justify-center"
                dangerouslySetInnerHTML={{ __html: parsedContent }}
              />
            ) : (
              <p>No details available</p>
            )}
          </div>
        </div>
      </section>
      <hr />

      <section>
        <FeaturedStartups />
      </section>
      <hr />

      <section>
        <div className="mx-6 my-6 flex justify-center md:mx-10 md:my-12 lg:mx-16">
          <div className="articleBox">
            <h2 className="text-24-medium">Comments</h2>
            <p>Comments will be available soon</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Page;
