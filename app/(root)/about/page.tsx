'use client';
import React from 'react';

function Page() {
  return (
    <>
      <section className="blueContainer items-center px-8 pb-12 pt-16">
        <div className="textBox">
          <h1>Bring Light to Your Misery - About Us</h1>
        </div>
        <br />
        <h3 className="max-w-[800px] justify-center">
          Welcome to StartDown! It&apos;s not quite a startup, and not quite a breakdown — just a
          quirky little platform I built as part of my portfolio (yes, the code is clean, I
          promise).
        </h3>
      </section>

      <section>
        <div className="mx-6 my-6 flex flex-col items-center justify-center md:mx-20 md:my-12 lg:mx-32">
          <div className="articleBox">
            <div className="max-w-[600px] justify-center">
              <p>
                In the world of tech, everyone&apos;s chasing that mythical &quot;unicorn&quot; —
                the billion-dollar startup idea. So, I thought, why not have a little fun with it?
                StartDown is my tongue-in-cheek tribute to those wild ideas that might just be
                brilliant... or totally bonkers. It&apos;s a space where people can throw their
                craziest concepts into the void (or the internet) and maybe, just maybe, get some
                feedback. It&apos;s also part of my portfolio. A functional joke with real code
                behind it.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Page;
