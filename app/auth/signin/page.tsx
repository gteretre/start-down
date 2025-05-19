import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth'; // adjust path if needed
import SignInClient from './SignInClient';
import fs from 'fs';
import path from 'path';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { acceptterms?: string };
}) {
  const session = await auth();
  if (!session && (await searchParams).acceptterms === '1') redirect('/auth/signin');
  if (session?.user?.termsAcceptedAt && (await searchParams).acceptterms === '1') redirect('/');
  if (session?.user && (await searchParams).acceptterms !== '1') {
    redirect('/');
  }

  let terms = '';
  try {
    terms = fs.readFileSync(path.join(process.cwd(), 'public/docs/terms.md'), 'utf8');
  } catch {
    terms = 'Terms of Service unavailable.';
  }
  return <SignInClient terms={terms} />;
}
