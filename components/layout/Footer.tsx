import Link from 'next/link';
import Image from 'next/image';

function Footer() {
  return (
    <footer
      id="footer"
      className="select-none bg-primary px-4 py-4 text-center text-xs text-white shadow-md md:px-8"
    >
      {/* Desktop Layout */}
      <div
        className="mx-auto hidden flex-row items-center gap-20 md:flex"
        style={{ maxWidth: '1600px' }}
      >
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1 hover:underline">
            <Image
              src="/logo.png"
              alt="logo"
              width={20}
              height={20}
              className="hover:desaturate-20 rounded-3xl"
            />
            <span className="text-xs">StartDown</span>
          </Link>
          <div className="pointer-events-none flex items-center gap-4">
            <span className="text-xs">© Michał Kowalski {new Date().getFullYear()}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/docs/privacy" className="text-white hover:underline">
            Privacy
          </Link>
          <Link href="/docs/terms" className="hover:underline">
            Terms
          </Link>
          <Link href="/docs" className="hover:underline">
            Docs
          </Link>
          <Link href="/about" className="hover:underline">
            About
          </Link>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="mx-auto flex flex-col items-center gap-4 md:hidden">
        <Link href="/" className="flex items-center gap-2 hover:underline">
          <Image
            src="/logo.png"
            alt="logo"
            width={24}
            height={24}
            className="hover:desaturate-20 rounded-3xl"
          />
          <span className="text-sm font-medium">StartDown</span>
        </Link>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <Link
            href="/docs/privacy"
            className="rounded px-2 py-1 hover:underline active:bg-white/10"
          >
            Privacy
          </Link>
          <Link href="/docs/terms" className="rounded px-2 py-1 hover:underline active:bg-white/10">
            Terms
          </Link>
          <Link href="/docs" className="rounded px-2 py-1 hover:underline active:bg-white/10">
            Docs
          </Link>
          <Link href="/about" className="rounded px-2 py-1 hover:underline active:bg-white/10">
            About
          </Link>
        </div>

        <div className="mt-2 text-xs opacity-80">© Michał Kowalski {new Date().getFullYear()}</div>
      </div>
    </footer>
  );
}

export default Footer;
