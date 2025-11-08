import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import SignInClient from './SignInClient';
import fs from 'fs';
import path from 'path';

type PageProps = {
  searchParams?: Promise<{ acceptterms?: string | string[] | undefined }>;
};

const resolveQueryParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function SignInPage({ searchParams }: PageProps) {
  const session = await auth();
  const params = searchParams ? await searchParams : undefined;
  const acceptTerms = resolveQueryParam(params?.acceptterms);

  if (!session && acceptTerms === '1') redirect('/auth/signin');
  if (session?.user?.termsAcceptedAt && acceptTerms === '1') redirect('/');
  if (session?.user && acceptTerms !== '1') {
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
