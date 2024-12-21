import React from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Github, Chrome, Unplug, Pencil, User } from "lucide-react";

import { auth, signOut, signIn } from "@/auth";
import Tooltip from "./Tooltip";
import UIMode from "@/components/UIMode";
import { client } from "@/sanity/lib/client";
import { AUTHOR_BY_ID_QUERY } from "@/lib/queries";
// const UIMode = dynamic(() => import("@/components/UIMode"), { ssr: false });

const Navbar = async () => {
  const session = await auth();
  let user = null;
  if (session && session.user) {
    const id = session.user.id;
    user = await client.fetch(AUTHOR_BY_ID_QUERY, { id });
  }
  console.log(session);

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
              <Tooltip text={`${user?.username}'s Profile` || "Profile"}>
                <Link href={`/user/${user?.username}`}>
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
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
