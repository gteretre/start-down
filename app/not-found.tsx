import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[60vh] flex-col items-center justify-center p-8">
        <h1 className="mb-4 text-4xl font-bold text-primary">404 - Page Not Found</h1>
        <p className="mb-8 text-lg text-gray-500">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="search-btn rounded-full px-6 py-2">
          Go Home
        </Link>
      </main>
    </>
  );
}
