import Link from 'next/link';
import Image from 'next/image';

function Footer() {
  return (
    <footer
      id="footer"
      className="select-none bg-primary px-8 py-4 text-center text-xs text-white shadow-md"
    >
      <div className="mx-auto flex flex-row items-center gap-20" style={{ maxWidth: '1600px' }}>
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
          <Link href="/docs/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/docs/terms" className="hover:underline">
            Terms
          </Link>
          <Link href="/about" className="hover:underline">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
