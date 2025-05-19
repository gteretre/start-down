import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LibraryIcon, Pencil } from 'lucide-react';

import Tooltip from '@/components/common/Tooltip';
import UIMode from '@/components/layout/UIMode';
import GoogleTranslateToggle from '@/components/layout/GoogleTranslate';
import { SignInButtons, SignOutButton } from '@/components/user/AuthButtons';
import { auth } from '@/lib/auth';
import { ProfilePicture } from '@/components/ImageUtilities';

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
          <div id="navbar-text" className="flex items-center">
            {session && session.user ? (
              <>
                <Link href="/startup/create" className="inline-flex items-center">
                  <Tooltip text="Create" position="left">
                    <Pencil />
                  </Tooltip>
                </Link>
                <Link href="/library" className="inline-flex items-center">
                  <Tooltip text="Library" position="left">
                    <LibraryIcon />
                  </Tooltip>
                </Link>
                <SignOutButton />
                <Link href={`/user/${session.user.username}`} className="inline-flex items-center">
                  <Tooltip text={`${session.user.username}'s Profile`} position="left">
                    <ProfilePicture
                      src={session?.user?.image}
                      alt="Profile picture"
                      width={40}
                      height={40}
                      className="avatar"
                    />
                  </Tooltip>
                </Link>
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
