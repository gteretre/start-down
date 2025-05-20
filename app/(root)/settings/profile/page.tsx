import { notFound } from 'next/navigation';

import { getAuthorByUsername } from '@/lib/queries';
import { auth } from '@/lib/auth';
import ProfileForm from '@/components/user/ProfileForm';

const Page = async () => {
  const session = await auth();
  if (!session || !session.user || !session.user.username) {
    return notFound();
  }
  const user = await getAuthorByUsername(session.user.username);
  if (!user) return notFound();

  return (
    <>
      <div className="header-container">
        <h1>Edit Your Profile</h1>
      </div>
      <ProfileForm user={user} />
    </>
  );
};

export default Page;
