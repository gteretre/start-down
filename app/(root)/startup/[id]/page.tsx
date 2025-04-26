import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import markdownit from 'markdown-it';
const md = markdownit({ html: true });

import { getStartupById } from '@/lib/queries';
import { formatDate, formatDateAgo } from '@/lib/utils';
import ShareButton from '@/components/ui/ShareButton';
import ViewClient from '@/components/ViewClient';
import Tooltip from '@/components/Tooltip';
import FeaturedStartups from '@/components/FeaturedStartups';
import { ObjectId } from 'mongodb';
import { auth } from '@/lib/auth';
import Adds from '@/components/Adds';
import type { Startup } from '@/lib/models';

const Page = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;
  const session = await auth();
  if (!ObjectId.isValid(id)) return notFound();

  const postOrNull = await getStartupById(id);
  if (!postOrNull) return notFound();
  const post: Startup = postOrNull;
  const createdAtStr =
    typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString();

  const parsedContent = md.render(post.pitch);
  return (
    <>
      <section className="blueContainer flex flex-col px-8 py-4">
        <div className="m-auto max-w-[800px] justify-center">
          <div>
            <div
              className="mx-6 my-8 flex justify-between gap-20 md:mx-12"
              style={{ cursor: 'default' }}
            >
              <Tooltip text={`Created: ${formatDateAgo(createdAtStr)}`}>
                <p className="cursor-default text-start">{formatDate(createdAtStr)}</p>
              </Tooltip>
              <ViewClient
                id={id}
                initialViews={post.views}
                incrementOnMount={true}
                isLoggedIn={!!session}
              />
            </div>
            <div className="textBox">
              <p
                className={
                  post.title.length <= 40
                    ? 'animated-heading text-4xl font-bold'
                    : post.title.length <= 60
                      ? 'animated-heading text-2xl font-bold'
                      : 'animated-heading truncate text-xl font-bold'
                }
                title={post.title}
              >
                {post.title}
              </p>
            </div>
            <div className="mx-8 mt-8 text-start lg:mx-32">
              <h3>{post.description}</h3>
            </div>
          </div>
          <div className="author mx-12">
            <Tooltip text={post.author.bio}>
              <Link className="flex justify-between gap-2" href={`/user/${post.author.username}`}>
                <Image
                  src={
                    post.author.image?.startsWith('http') || post.author.image?.startsWith('/')
                      ? post.author.image
                      : '/logo.png'
                  }
                  alt={post.author.name + 's avatar'}
                  width={48}
                  height={48}
                  className="avatar"
                />
                <div className="flex flex-col items-start pt-1">
                  <p className="text-24-medium">
                    <strong>{post.author.name}</strong>
                  </p>
                  <p className="text-16-medium">@{post.author.username}</p>
                </div>
              </Link>
            </Tooltip>
            <ShareButton title={post.title} text={post.description} url={'/startup/' + post._id} />
          </div>
          <p className="category mx-12 text-end text-sm">{post.category}</p>
        </div>
      </section>

      <section>
        <div className="mx-6 my-6 flex flex-col items-center justify-center md:mx-20 md:my-12 lg:mx-32">
          <Image
            src={
              post.image?.startsWith('http') || post.image?.startsWith('/')
                ? post.image
                : `https://placehold.co/600x400?text=${encodeURIComponent(post.title)}`
            }
            width={600}
            height={400}
            alt={post.title}
            className="startup-image mb-8"
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

      <section className="flex flex-row items-start justify-center">
        <Adds session={session} />
        <div className="mx-4 flex-1">
          <FeaturedStartups />
        </div>
        <Adds session={session} />
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
};

export default Page;
