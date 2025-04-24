import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
// import "easymde/dist/easymde.min.css";
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>;

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'StartDown',
  description: 'Your Startup is a Joke',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
