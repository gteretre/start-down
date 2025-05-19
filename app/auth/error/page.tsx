import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth'; // adjust path if needed
import ErrorClient from './ErrorClient';

export default async function AuthErrorPage() {
  const session = await auth();
  if (session?.user) {
    redirect('/');
  }
  return <ErrorClient />;
}
