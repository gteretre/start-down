import { notFound } from 'next/navigation';
import Image from 'next/image';

import { getAuthorByUsername } from '@/lib/queries';
import { auth } from '@/lib/auth';
import ProfileForm from '@/components/ProfileForm';
import './stars.css';

const Page = async () => {
  const session = await auth();
  if (!session || !session.user || !session.user.username) {
    return notFound();
  }
  const user = await getAuthorByUsername(session.user.username);
  if (!user) return notFound();

  return (
    <>
      <section className="relative flex flex-col items-center justify-center gap-6 overflow-hidden bg-card p-8 text-center">
        <div className="z-10 flex w-full max-w-2xl flex-col items-center justify-center gap-5">
          <h1 className="animated-heading text-3xl font-extrabold leading-tight tracking-tight text-primary">
            Edit Your Profile
          </h1>
        </div>
      </section>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 lg:flex-row lg:items-start lg:gap-12">
        <aside className="hidden w-full flex-col items-center rounded-3xl bg-card p-8 shadow-lg lg:sticky lg:top-8 lg:flex lg:w-1/3">
          <div className="flex flex-col items-center gap-4">
            <h1 className="animated-heading mb-2 text-3xl font-extrabold leading-tight tracking-tight text-primary drop-shadow-lg">
              {`${user.name}'s Profile`}
            </h1>

            <div className="relative">
              <Image
                src={user.image || '/logo.png'}
                alt={user.username + "'s avatar"}
                width={120}
                height={120}
                className="avatar"
              />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold">{user.name}</h3>
              <h4 className="text-gray-500">@{user.username}</h4>
            </div>
          </div>
          <p className="mb-2 text-xl font-medium text-muted-foreground">
            {user.bio || 'No bio provided yet.'}
          </p>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            On Start Down since {user.createdAt.toLocaleDateString()}
          </p>
        </aside>
        <section>
          <ProfileForm user={user} />
        </section>
      </div>
    </>
  );
};

export default Page;
