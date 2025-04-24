import Link from 'next/link';

function Footer() {
  return (
    <footer
      id="footer"
      className="mt-8 flex w-full flex-col items-center justify-between bg-primary px-8 py-4 text-white shadow-md md:flex-row"
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold">© Michał Kowalski {new Date().getFullYear()}</span>
      </div>
      <div className="mt-2 flex items-center gap-4 md:mt-0">
        <Link href="/about" className="transition-colors hover:text-secondary hover:underline">
          Who are we?
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
