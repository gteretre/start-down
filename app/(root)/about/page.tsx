'use client';
import React from 'react';
import Image from 'next/image';

function Page() {
  return (
    <>
      <section className="relative flex flex-col items-center justify-center gap-6 overflow-hidden bg-gradient-to-br from-blue-400 via-blue-200 to-transparent px-8 pb-14 pt-20 text-center dark:bg-gradient-to-br dark:from-blue-900 dark:via-blue-950 dark:to-black">
        <div className="z-10 flex w-full max-w-2xl flex-col items-center justify-center gap-5">
          <h1 className="animated-heading mb-2 text-5xl font-extrabold leading-tight tracking-tight text-primary drop-shadow-lg md:text-6xl">
            About <span className="marked-text">StartDown</span>
          </h1>
          <p className="mb-2 text-xl font-medium text-muted-foreground md:text-2xl">
            Not quite a startup, not quite a breakdown — just a quirky little platform for your
            wildest ideas.
          </p>
        </div>
        <div className="relative mt-8 flex items-center justify-center">
          <Image
            src="/mainpageimage.jpg"
            alt="About illustration"
            width={320}
            height={320}
            className="mx-auto mb-4 rounded-3xl object-cover shadow-lg"
            draggable={false}
          />
        </div>
      </section>

      <section>
        <div className="mx-auto my-8 max-w-3xl rounded-xl p-8">
          <h2 className="mb-4 text-3xl font-bold text-primary">Why StartDown?</h2>
          <div className="mx-auto">
            <p className="mb-5 text-justify text-xl">
              In the world of tech, everyone&apos;s chasing that mythical{' '}
              <span className="font-bold">&quot;unicorn&quot;</span> — the billion-dollar startup
              idea. So, I thought, why not have a little fun with it? StartDown is my
              tongue-in-cheek tribute to those wild ideas that might just be brilliant... or totally
              bonkers.
            </p>
            <p className="mb-5 text-justify text-xl">
              It&apos;s a space where people can throw their craziest concepts into the void (or the
              internet) and maybe, just maybe, get some feedback. It&apos;s also part of my
              portfolio. A functional joke with real code behind it.
            </p>
            <p className="mb-5 text-justify text-xl">
              Whether you&apos;re here to laugh, to share, or to be inspired by the most outlandish
              ideas, welcome to the community!
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Page;
