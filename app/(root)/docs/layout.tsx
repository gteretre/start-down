import Link from 'next/link';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex">
      <aside className="sidebar sticky">
        <h2 className="select-none pb-4 text-xl font-bold text-primary">Docs</h2>
        <hr className="pb-2" />
        <Link href="/docs/terms" className="btn-normal">
          Terms of Service
        </Link>
        <Link href="/docs/privacy" className="btn-normal">
          Privacy Policy
        </Link>
      </aside>
      <div className="mx-auto max-w-3xl flex-1 items-center p-8">{children}</div>
    </main>
  );
}
