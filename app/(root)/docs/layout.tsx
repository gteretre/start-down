'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarSections = [
  {
    title: 'Guides',
    links: [
      { href: '/docs/tutorial-pitch-editor', label: 'Pitch Editor' },
      { href: '/docs/guidelines-startup-form', label: 'Startup Form' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/docs/terms', label: 'Terms of Service' },
      { href: '/docs/privacy', label: 'Privacy Policy' },
    ],
  },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <main className="flex">
      <aside className="sidebar sticky">
        <h2 className="select-none pb-4 text-xl font-bold text-primary">Docs</h2>
        <hr className="pb-2" />
        {sidebarSections.map((section) => (
          <div className="mb-4" key={section.title}>
            <h3 className="mb-2 select-none text-base font-semibold text-muted-foreground">
              {section.title}
            </h3>
            {section.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`btn-normal ${pathname === link.href ? 'font-bold underline' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </aside>
      <div className="articleBox mx-auto max-w-3xl flex-1 items-center p-8">{children}</div>
    </main>
  );
}
