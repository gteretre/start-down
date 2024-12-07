import React from "react";
import Link from "next/link";
import Image from "next/image";

import { auth, signOut, signIn } from "@/auth";
import { Github, Chrome, Unplug, Pencil, User } from "lucide-react";
import Tooltip from "./Tooltip";

import UIMode from "@/components/UIMode";

const Navbar = async () => {
  const session = await auth();

  return (
    <header id="header">
      <nav id="navbar">
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

        <Tooltip text="Dev Only">
          {" "}
          Compiled: {new Date().toLocaleTimeString()}
        </Tooltip>
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
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Tooltip text="Logout">
                  <button className="btn-pure" type="submit">
                    {" "}
                    <span>
                      <Unplug />
                    </span>
                  </button>
                </Tooltip>
              </form>
              <Tooltip text={session?.user?.name || "Profile"}>
                <Link href="/user/${session?.id}">
                  <span>
                    <User />
                  </span>
                </Link>
              </Tooltip>
            </>
          ) : (
            <>
              <form
                action={async () => {
                  "use server";
                  await signIn("github");
                }}
              >
                <Tooltip text="Sign In With GitHub">
                  <button className="btn-pure" type="submit">
                    <span>
                      <Github />
                    </span>
                  </button>
                </Tooltip>
              </form>
              <form
                action={async () => {
                  "use server";
                  await signIn("google");
                }}
              >
                <Tooltip text="Sign In With Google">
                  <button className="btn-pure" type="submit">
                    <span>
                      <Chrome />
                    </span>
                  </button>
                </Tooltip>
              </form>
            </>
          )}
          <Tooltip text="Dark Mode">
            <UIMode />
          </Tooltip>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
