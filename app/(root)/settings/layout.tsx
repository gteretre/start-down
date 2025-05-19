import { redirect } from 'next/navigation';
import React from 'react';
import Link from 'next/link';

import { auth } from '@/lib/auth';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || !session.user || !session.user.username) {
    redirect('/auth/signin');
  }

  return (
    <main className="flex">
      <aside className="sidebar sticky w-[180px]">
        <h2 className="select-none pb-4 text-xl font-bold text-primary">Settings</h2>
        <hr className="pb-2" />
        <Link href="/settings/profile" className="btn-normal">
          Profile
        </Link>
        <Link href="/settings/account" className="btn-normal">
          Account
        </Link>
      </aside>
      <div>{children}</div>
    </main>
  );
}
