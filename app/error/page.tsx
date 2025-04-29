import Link from 'next/link';

export default function GeneralErrorPage() {
  return (
    <>
      <main className="flex min-h-[60vh] flex-col items-center justify-center p-8">
        <h1 className="mb-4 text-4xl font-bold text-primary">Something Went Wrong</h1>
        <p className="mb-8 text-lg text-gray-500">
          Sorry, an unexpected error occurred. Please try again later or contact support if the
          problem persists.
        </p>
        <Link href="/" className="rounded-full px-6 py-2">
          Go Home
        </Link>
      </main>
    </>
  );
}
