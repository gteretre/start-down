import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Pencil, User } from "lucide-react";

import Tooltip from "./Tooltip";
import UIMode from "@/components/UIMode";
import GoogleTranslateToggle from "./GoogleTranslate";
import { SignInButtons, SignOutButton } from "./AuthButtons";

import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";

const Navbar = async () => {
  const session = await getServerSession(options);

  return (
    <header id="header">
      <nav id="navbar">
        <div id="navbar-text">
          <Tooltip text="Home">
            <Link href="/">
              <Image
                id="logo"
                src="/logo.png"
                alt="logo"
                width={50}
                height={50}
              />
            </Link>
          </Tooltip>
          <Tooltip text="Toogle Dark Mode">
            <UIMode />
          </Tooltip>
          <GoogleTranslateToggle />
        </div>
        <div className="hidden md:block">
          <Tooltip text="Dev Only">
            {" "}
            Compiled: {new Date().toLocaleTimeString()}
          </Tooltip>
        </div>

        <div id="navbar-text">
          {session && session.user ? (
            <>
              <Tooltip text="Create">
                <Link href="/startup/create">
                  <span>
                    <Pencil />
                  </span>
                </Link>
              </Tooltip>
              <SignOutButton />
              <Tooltip text={`${session.user.username}'s Profile`}>
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
      </nav>
    </header>
  );
};

export default Navbar;
