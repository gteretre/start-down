import { notFound } from 'next/navigation';

import { getAuthorByUsername } from '@/lib/queries';
import { auth } from '@/lib/auth';
import AccountForm from '@/components/user/AccountForm';

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
        <h1>Account Settings</h1>
      </div>
      <AccountForm user={user} />
    </>
  );
};

export default Page;
