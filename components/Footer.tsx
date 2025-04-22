import Link from "next/link";

function Footer() {
  return (
    <footer
      id="footer"
      className="w-full bg-primary text-white py-4 px-8 flex flex-col md:flex-row items-center justify-between shadow-md mt-8"
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold">
          © Michał Kowalski {new Date().getFullYear()}
        </span>
      </div>
      <div className="flex items-center gap-4 mt-2 md:mt-0">
        <Link
          href="/about"
          className="hover:underline hover:text-secondary transition-colors"
        >
          Who are we?
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
