import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Github, Chrome, Unplug, Pencil, User } from "lucide-react";

import Tooltip from "./Tooltip";
import UIMode from "@/components/UIMode";
import GoogleTranslateToggle from "./GoogleTranslate";

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
              {/* <form
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
              </form> */}
              <Link href="/api/auth/signout" className="nav-link">
                <Unplug />
              </Link>
              <Tooltip text={`${session.user.username}'s Profile`}>
                <Link href={`/user/${session.user.username}`}>
                  <span>
                    <User />
                  </span>
                </Link>
              </Tooltip>
            </>
          ) : (
            // <>
            //   <form
            //     action={async () => {
            //       "use server";
            //       await signIn("github");
            //     }}
            //   >
            //     <Tooltip text="Sign In With GitHub">
            //       <button className="btn-pure" type="submit">
            //         <span>
            //           <Github />
            //         </span>
            //       </button>
            //     </Tooltip>
            //   </form>
            //   <form
            //     action={async () => {
            //       "use server";
            //       await signIn("google");
            //     }}
            //   >
            //     <Tooltip text="Sign In With Google">
            //       <button className="btn-pure" type="submit">
            //         <span>
            //           <Chrome />
            //         </span>
            //       </button>
            //     </Tooltip>
            //   </form>
            // </>

            <Link href="/api/auth/signin" className="nav-link">
              <Github />
              <Chrome />
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
