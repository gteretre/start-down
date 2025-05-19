'use client';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const providers = [
  {
    id: 'github',
    name: 'GitHub',
    icon: (
      <svg
        role="img"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.245-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.625-5.475 5.92.43.37.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    id: 'google',
    name: 'Google',
    icon: (
      <svg
        role="img"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <path d="M21.805 10.023h-9.52v3.977h5.477c-.236 1.236-1.42 3.627-5.477 3.627-3.293 0-5.98-2.73-5.98-6.09s2.687-6.09 5.98-6.09c1.875 0 3.137.797 3.86 1.484l2.64-2.563C17.09 2.797 14.98 1.75 12.245 1.75 6.98 1.75 2.57 6.16 2.57 11.465s4.41 9.715 9.715 9.715c5.6 0 9.29-3.93 9.29-9.48 0-.637-.07-1.127-.17-1.677z" />
      </svg>
    ),
  },
  {
    id: 'azure-ad',
    name: 'Microsoft',
    icon: (
      <svg
        role="img"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <rect x="1" y="1" width="10" height="10" />
        <rect x="13" y="1" width="10" height="10" />
        <rect x="1" y="13" width="10" height="10" />
        <rect x="13" y="13" width="10" height="10" />
      </svg>
    ),
  },
];

export default function SignInClient({ terms = '' }: { terms?: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const acceptTerms = searchParams.get('acceptterms') === '1';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAcceptTerms() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/accept-terms', {
      method: 'POST',
      credentials: 'include',
    });
    if (res.ok) {
      await signIn(undefined, { redirect: false });
      router.replace('/');
    } else {
      setError('Failed to accept terms. Please try again.');
    }
    setLoading(false);
  }

  if (acceptTerms) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-950">
        <div className="flex min-h-[700px] w-full max-w-4xl flex-col items-center rounded-2xl bg-white/90 p-8 shadow-xl dark:bg-gray-900/90">
          <h1 className="mb-2 text-3xl font-extrabold text-primary">Accept Terms of Service</h1>
          <div className="mb-4 h-[600px] w-full overflow-y-auto whitespace-pre-line rounded border bg-gray-50 p-4 text-sm">
            {terms || 'Loading...'}
          </div>
          {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
          <button
            className="btn-primary mt-4 w-full max-w-xs rounded px-4 py-2 font-semibold"
            onClick={handleAcceptTerms}
            disabled={loading}
          >
            {loading ? 'Accepting...' : 'Accept Terms'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-950">
      <div className="flex w-full max-w-md flex-col items-center rounded-2xl bg-white/90 p-8 shadow-xl dark:bg-gray-900/90">
        <h1 className="mb-2 text-3xl font-extrabold text-primary">Sign in to StartDown</h1>
        <p className="mb-8 text-center text-gray-500 dark:text-gray-300">
          Welcome! Please choose a provider to sign in and access your account.
        </p>
        <div className="flex w-full flex-col gap-4">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => signIn(provider.id, { callbackUrl: '/auth/signin?new=1' })}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#F0F0F0] px-4 py-2 font-medium text-gray-900 transition hover:bg-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-primary/60"
              type="button"
            >
              {provider.icon}
              Sign in with {provider.name}
            </button>
          ))}
        </div>
        <div className="mt-8 text-center text-xs text-gray-400">
          By signing in, you agree to our{' '}
          <a href="/terms" className="underline hover:text-primary">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </main>
  );
}
