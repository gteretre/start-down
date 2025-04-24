'use client';
import React from 'react';
import { Github, Chrome, Unplug } from 'lucide-react';
import Tooltip from './Tooltip';
import { signIn, signOut } from 'next-auth/react';

export function SignInButtons() {
  return (
    <>
      <Tooltip text="Sign In With GitHub">
        <button className="btn-pure" type="button" onClick={() => signIn('github')}>
          <span>
            <Github />
          </span>
        </button>
      </Tooltip>
      <Tooltip text="Sign In With Google">
        <button className="btn-pure" type="button" onClick={() => signIn('google')}>
          <span>
            <Chrome />
          </span>
        </button>
      </Tooltip>
    </>
  );
}

export function SignOutButton() {
  return (
    <Tooltip text="Logout">
      <button className="btn-pure" type="button" onClick={() => signOut({ callbackUrl: '/' })}>
        <span>
          <Unplug />
        </span>
      </button>
    </Tooltip>
  );
}
