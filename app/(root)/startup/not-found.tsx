import Link from "next/link";

export default function StartupNotFound() {
  return (
    <>
      <main className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <h1 className="text-4xl font-bold mb-4 text-primary">
          Startup Not Found
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          Sorry, the startup you are looking for does not exist or has been
          deleted.
        </p>
        <Link href="/" className="search-btn px-6 py-2 rounded-full">
          Go Home
        </Link>
      </main>
    </>
  );
}
