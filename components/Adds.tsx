'use client';
import React, { useEffect } from 'react';

type AddsProps = {
  session?: { user?: { role?: string } };
};

const Adds = ({ session }: AddsProps) => {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        window.adsbygoogle.push({});
      } catch {
        // ignore
      }
    }
  }, []);

  if (session?.user?.role === 'admin') return null;

  return (
    <div className="bg-bg relative mx-8 my-8 hidden h-[600px] w-40 select-none flex-col items-center justify-center rounded-lg text-sm text-foreground ring-1 ring-ring lg:flex">
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: 160, height: 600 }}
          data-ad-client="ca-pub-3940256099942544"
          data-ad-slot="3363858005"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};

export default Adds;
