import { notFound } from 'next/navigation';

import { getStartupBySlug } from '@/lib/queries';
import { auth } from '@/lib/auth';
import type { Startup } from '@/lib/models';
import StartupUpdateForm from '@/components/StartupUpdateForm';

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: slug } = await params;
  const session = await auth();

  const fetchedPost = await getStartupBySlug(slug);
  if (!fetchedPost) return notFound();

  const post: Startup = fetchedPost;

  if (session?.user?.username !== post.author.username) return notFound();
  return (
    <>
      <section className="relative flex flex-col items-center justify-center gap-6 overflow-hidden bg-card p-8 text-center">
        <div className="z-10 flex w-full max-w-2xl flex-col items-center justify-center gap-5">
          <h1 className="animated-heading text-3xl font-extrabold leading-tight tracking-tight text-primary">
            Edit {post.title}
          </h1>
        </div>
      </section>
      <section>
        <StartupUpdateForm startup={post} />
      </section>
    </>
  );
};

export default Page;
