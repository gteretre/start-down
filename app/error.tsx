'use client';

import Link from 'next/link';
import { useEffect } from 'react';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const isMongoError = (error: Error) => {
  const message = error.message?.toLowerCase() ?? '';
  return error.name === 'MongoConnectionError' || message.includes('mongodb');
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const mongoIssue = isMongoError(error);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
          <h1 className="text-3xl font-semibold">Something went wrong</h1>
          {mongoIssue ? (
            <p className="max-w-xl text-muted-foreground">
              We cannot reach the database right now. Make sure the MongoDB service is running. If
              you are running Docker, confirm the <code>mongo</code> container is healthy and try
              again.
            </p>
          ) : (
            <p className="max-w-xl text-muted-foreground">
              An unexpected error occurred. You can try again or head back to the homepage.
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground shadow-sm"
            >
              Go home
            </Link>
          </div>
          {process.env.NODE_ENV !== 'production' && (
            <pre className="mt-6 max-w-2xl overflow-x-auto rounded-md bg-muted p-4 text-left text-xs text-muted-foreground">
              {error.message}
              {error.digest ? `\nReference: ${error.digest}` : ''}
            </pre>
          )}
        </main>
      </body>
    </html>
  );
}
