import React from 'react';

import { auth } from '@/lib/auth';
import StartupForm from '@/components/startup/StartupForm';

const Page = async () => {
  const session = await auth();

  return (
    <>
      <section className="relative flex flex-col items-center justify-center gap-6 overflow-hidden bg-card p-8 text-center">
        <div className="z-10 flex w-full max-w-2xl flex-col items-center justify-center gap-5">
          <h1 className="animated-heading text-3xl font-extrabold leading-tight tracking-tight text-primary">
            Submit Your <span className="marked-text">Terrible</span> Startup Idea
          </h1>
          <h3 className="text-lg font-medium text-muted-foreground">
            {session
              ? 'Fill out the form below to share your idea with the world. Make it bold, creative, and memorable!'
              : 'Please log in to submit your startup idea.'}
          </h3>
        </div>
      </section>
      {session && (
        <section className="py-8">
          <StartupForm mode="create" />
        </section>
      )}
    </>
  );
};

export default Page;
