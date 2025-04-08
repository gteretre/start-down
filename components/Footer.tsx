import Link from "next/link";

function Footer() {
  return (
    <footer className="flex flex-col items-center justify-center h-16">
      <p>©Copyright Michał Kowalski {new Date().getFullYear()}</p>
      <p>
        <Link href={"/about"}>Who are we?</Link>
      </p>
    </footer>
  );
}

export default Footer;
