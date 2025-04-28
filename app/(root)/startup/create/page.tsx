import React from 'react';

import { auth } from '@/lib/auth';
import StartupForm from '@/components/StartupForm';

const Page = async () => {
  const session = await auth();

  return (
    <>
      <section className="relative flex flex-col items-center justify-center gap-6 overflow-hidden px-8 pb-14 pt-20 text-center">
        <div className="z-10 flex w-full max-w-2xl flex-col items-center justify-center gap-5">
          <h1 className="animated-heading mb-2 text-5xl font-extrabold leading-tight tracking-tight text-primary drop-shadow-lg md:text-6xl">
            Submit Your <span className="marked-text">Terrible</span> Startup Idea
          </h1>
          <p className="mb-2 text-xl font-medium text-muted-foreground md:text-2xl">
            {session
              ? 'Share your idea with thousands of users around the world!'
              : 'Log in to submit your startup idea.'}
          </p>
        </div>
      </section>
      {session && (
        <section>
          <StartupForm />
        </section>
      )}
    </>
  );
};

export default Page;
