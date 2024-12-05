import React from "react";
import Link from "next/link";
import Image from "next/image";
import { auth, signOut, signIn } from "@/auth";
import { Github, Chrome, Unplug, Pencil, User } from "lucide-react";

import UIMode from "@/components/UIMode";

const Navbar = async () => {
  const session = await auth();

  return (
    <header id="header">
      <nav id="navbar">
        <Link href="/">
          <Image id="logo" src="/logo.png" alt="logo" width={50} height={50} />
        </Link>
        Compiled: {new Date().toLocaleTimeString()}
        <div id="navbar-text">
          {session && session.user ? (
            <>
              <Link href="/startup/create">
                <span>
                  <Pencil />
                  Create
                </span>
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="btn-pure" type="submit">
                  {" "}
                  <span>
                    <Unplug />
                    Logout
                  </span>
                </button>
              </form>
              <Link href="/user/${session?.id}">
                <span>
                  <User />
                  {session?.user?.name}
                </span>
              </Link>
            </>
          ) : (
            <>
              <form
                action={async () => {
                  "use server";
                  await signIn("github");
                }}
              >
                <button className="btn-pure" type="submit">
                  <span>
                    <Github />
                    GitHub
                  </span>
                </button>
              </form>
              <form
                action={async () => {
                  "use server";
                  await signIn("google");
                }}
              >
                <button className="btn-pure" type="submit">
                  <span>
                    <Chrome />
                    Google
                  </span>
                </button>
              </form>
            </>
          )}
          <UIMode />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
