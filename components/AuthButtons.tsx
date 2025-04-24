'use client';
import React from 'react';
import { Github, Chrome, Unplug } from 'lucide-react';
import Tooltip from './Tooltip';
import { signIn, signOut } from 'next-auth/react';

export function SignInButtons() {
  return (
    <>
      <div className="nav-element">
        <Tooltip text="Sign In With GitHub" position="left">
          <button className="btn-pure" type="button" onClick={() => signIn('github')}>
            <span>
              <Github />
            </span>
          </button>
        </Tooltip>
      </div>
      <div className="nav-element">
        <Tooltip text="Sign In With Google" position="left">
          <button className="btn-pure" type="button" onClick={() => signIn('google')}>
            <span>
              <Chrome />
            </span>
          </button>
        </Tooltip>
      </div>
    </>
  );
}

export function SignOutButton() {
  return (
    <div className="nav-element">
      <Tooltip text="Logout" position="left">
        <button className="btn-pure" type="button" onClick={() => signOut({ callbackUrl: '/' })}>
          <span>
            <Unplug />
          </span>
        </button>
      </Tooltip>
    </div>
  );
}
