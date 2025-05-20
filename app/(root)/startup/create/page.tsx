import React from 'react';

import { auth } from '@/lib/auth';
import StartupForm from '@/components/startup/StartupForm';

const Page = async () => {
  const session = await auth();

  return (
    <>
      <div className="header-container">
        <h1>
          Submit Your <span className="marked-text">Terrible</span> Startup Idea
        </h1>
        <h3 className="text-lg font-medium text-muted-foreground">
          {session
            ? 'Fill out the form below to share your idea with the world. Make it bold, creative, and memorable!'
            : 'Please log in to submit your startup idea.'}
        </h3>
      </div>
      {session && (
        <section className="py-8">
          <StartupForm mode="create" />
        </section>
      )}
    </>
  );
};

export default Page;
