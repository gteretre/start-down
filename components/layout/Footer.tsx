import Link from 'next/link';

function Footer() {
  return (
    <footer id="footer" className="select-none bg-primary px-8 py-4 text-white shadow-md">
      <div className="mx-auto flex w-full flex-row justify-between" style={{ maxWidth: '1600px' }}>
        <div className="pointer-events-none flex items-center gap-2">
          <span className="font-semibold">© Michał Kowalski {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/docs/privacy"
            className="transition-colors hover:text-secondary hover:underline"
          >
            Privacy Policy
          </Link>
          <Link
            href="/docs/terms"
            className="transition-colors hover:text-secondary hover:underline"
          >
            Terms of Service
          </Link>
          <Link href="/about" className="transition-colors hover:text-secondary hover:underline">
            About us
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
