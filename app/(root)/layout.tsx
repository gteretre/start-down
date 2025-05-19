import { redirect } from 'next/navigation';

import Footer from '@/components/layout/Footer';
import GoUpButton from '@/components/common/GoUpButton';
import Navbar from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/toaster';
import { auth } from '@/lib/auth';

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (session && !session?.user?.termsAcceptedAt) {
    redirect('/auth/signin?acceptterms=1');
  }
  return (
    <main className="font-work-sans flex min-h-screen flex-col">
      <div className="mx-auto w-full flex-1">
        <Navbar />
        <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        <Toaster />
      </div>
      <Footer />
      <GoUpButton />
    </main>
  );
}
