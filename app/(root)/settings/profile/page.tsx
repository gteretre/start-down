import { notFound } from 'next/navigation';

import { getAuthorByUsername } from '@/lib/queries';
import { auth } from '@/lib/auth';
import ProfileForm from '@/components/user/ProfileForm';
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
      <ProfileForm user={user} />
    </>
  );
};

export default Page;
