import React from "react";

import { auth } from "@/auth";
import StartupForm from "@/components/StartupForm";

const Page = async () => {
  const session = await auth();

  return (
    <>
      <section className="blueContainer items-center px-8 pb-12 pt-16">
        <div className="textBox">
          <h1>
            Submit Your <span className="marked-text">Terrible</span> Startup
            Idea
          </h1>
        </div>
        <div className="mt-10 typewriter">
          {session ? (
            <>
              <p>Share Your Idea With Thousands of Users Around the World!</p>
            </>
          ) : (
            <p>Log In to Submit Your Startup Idea</p>
          )}
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
