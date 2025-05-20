import { notFound } from 'next/navigation';

import { getStartupBySlug } from '@/lib/queries';
import { auth } from '@/lib/auth';
import type { Startup } from '@/lib/models';
import StartupForm from '@/components/startup/StartupForm';

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: slug } = await params;
  const session = await auth();

  const fetchedPost = await getStartupBySlug(slug);
  if (!fetchedPost) return notFound();

  const post: Startup = fetchedPost;

  if (session?.user?.username !== post.author.username) return notFound();
  return (
    <>
      <div className="header-container">
        <h1>Edit {post.title}</h1>
      </div>
      <section>
        <StartupForm
          startupId={post._id}
          startupSlug={post.slug}
          initialValues={{
            slug: post.slug,
            title: post.title,
            description: post.description,
            category: post.category,
            image: post.image || '',
            pitch: post.pitch,
          }}
          mode="edit"
        />
      </section>
    </>
  );
};

export default Page;
