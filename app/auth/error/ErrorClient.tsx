'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const errorMessages: Record<string, string> = {
  EmailOrUsernameExists:
    'An account with this email or username already exists. Please sign in with your original provider.',
  default: 'An unknown authentication error occurred. Please try again or contact support.',
};

export default function ErrorClient() {
  const searchParams = useSearchParams();
  const error = searchParams ? searchParams.get('error') : null;
  const message = error ? errorMessages[error] || errorMessages.default : null;

  const displayMessage = message ? (
    <div className="mb-8 text-red-600">{message}</div>
  ) : (
    <p className="mb-8 text-lg text-gray-500">
      Sorry, you have reached this page by accident or the error is unknown.
    </p>
  );

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-4xl font-bold text-primary">Authentication Error</h1>
      {displayMessage}
      <div>
        <Link href="/" className="rounded-full px-6 py-2">
          Go Home
        </Link>
        <Link href="/auth/signin" className="rounded-full px-6 py-2">
          Go to Login
        </Link>
      </div>
    </main>
  );
}
