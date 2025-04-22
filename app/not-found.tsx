import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <h1 className="text-4xl font-bold mb-4 text-primary">
          404 - Page Not Found
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="search-btn px-6 py-2 rounded-full">
          Go Home
        </Link>
      </main>
    </>
  );
}
