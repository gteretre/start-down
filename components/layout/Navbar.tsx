import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LibraryIcon, Pencil, User } from 'lucide-react';

import Tooltip from '@/components/common/Tooltip';
import UIMode from '@/components/layout/UIMode';
import GoogleTranslateToggle from '@/components/layout/GoogleTranslate';
import { SignInButtons, SignOutButton } from '../user/AuthButtons';
import { auth } from '@/lib/auth';

const Navbar = async () => {
  const session = await auth();

  return (
    <header id="header">
      <nav id="navbar" className="bg-inherit">
        <div
          className="mx-auto flex w-full items-center justify-between px-4"
          style={{ maxWidth: '1600px' }}
        >
          <div id="navbar-text" className="flex items-center gap-2">
            <Tooltip text="Home" position="right">
              <Link href="/">
                <span className="flex items-center gap-2">
                  <Image id="logo" src="/logo.png" alt="logo" width={40} height={40} />
                  <span
                    className="pageName"
                    style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '-0.5px' }}
                  >
                    StartDown
                  </span>
                </span>
              </Link>
            </Tooltip>
            <Tooltip text="Toggle Dark Mode" position="right">
              <UIMode />
            </Tooltip>
            <GoogleTranslateToggle />
          </div>
          <div id="navbar-text" className="flex items-center gap-2">
            {session && session.user ? (
              <>
                <Tooltip text="Create" position="left">
                  <Link href="/startup/create">
                    <span>
                      <Pencil />
                    </span>
                  </Link>
                </Tooltip>
                <Tooltip text="Library" position="left">
                  <Link href="/library">
                    <LibraryIcon />
                  </Link>
                </Tooltip>
                <SignOutButton />
                <Tooltip text={`${session.user.username}'s Profile`} position="left">
                  <Link href={`/user/${session.user.username}`}>
                    <span>
                      <User />
                    </span>
                  </Link>
                </Tooltip>
              </>
            ) : (
              <SignInButtons />
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
