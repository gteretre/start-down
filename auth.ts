import NextAuth from "next-auth";
import { writeClient } from "@/sanity/lib/write-client";

import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { AUTHOR_BY_ID_QUERY, AUTHOR_BY_EMAIL_QUERY } from "@/lib/queries";
import { client } from "@/sanity/lib/client";
//import bcrypt from "bcrypt";

const options = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          //scope: "openid email profile",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  // session: {
  //   strategy: "jwt",
  //   maxAge: 24 * 3600, // 1 day
  //   updateAge: 3600 // 1 hour
  // },
  // jwt: {
  //   maxAge: 1 * 24 * 60 * 60, // Token expiration time in seconds (1 day)
  //   encryption: true, // Enable encryption for the JWT
  //   verificationOptions: {
  //     algorithms: ["HS256"] // Algorithms to use for verifying the JWT
  //   }
  // },
  callbacks: {
    async signIn({
      user,
      account,
      profile
    }: {
      user: any;
      account: any;
      profile: any;
    }) {
      try {
        if (!profile || !user) {
          console.error("Profile is undefined");
          return false;
        }
        let existingUser = await client
          .withConfig({ useCdn: false })
          .fetch(AUTHOR_BY_ID_QUERY, {
            id: profile.id || user.id
          });
        if (!existingUser) {
          existingUser = await client
            .withConfig({ useCdn: false })
            .fetch(AUTHOR_BY_EMAIL_QUERY, {
              email: user.email
            });
        }
        if (!existingUser) {
          await writeClient.create({
            _type: "author",
            _id: profile.id,
            id: user.id,
            name: user?.name,
            username: profile?.login,
            email: user?.email,
            //image: user?.image,
            bio: profile?.bio || ""
          });
        }
        return true;
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false;
      }
    },
    async jwt(token: any, account: any, profile: any) {
      try {
        if (account && profile) {
          const user = await client
            .withConfig({ useCdn: false })
            .fetch(AUTHOR_BY_ID_QUERY, {
              id: profile?.id
            });
          // token.id = user._id;
          token.user = {
            id: user._id,
            email: user.email,
            name: user.name
          };
        }
      } catch (error) {
        console.error("Error during JWT token generation:", error);
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      //! WTF token is inside diffrent token object
      // cannot find the issue cause
      session.user = token.token.user;
      session.id = token.token.id;
      return session;
    }
  }
};

const { handlers, signIn, signOut, auth } = NextAuth(options);

export { handlers, signIn, signOut, auth };
