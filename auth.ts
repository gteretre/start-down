import NextAuth from "next-auth";
import { writeClient } from "@/sanity/lib/write-client";

import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { AUTHOR_BY_ID_QUERY } from "@/lib/queries";
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
  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60 // 1 day
  },
  jwt: {
    maxAge: 1 * 24 * 60 * 60, // Token expiration time in seconds (1 day)
    encryption: true, // Enable encryption for the JWT
    verificationOptions: {
      algorithms: ["HS256"] // Algorithms to use for verifying the JWT
    }
  },
  callbacks: {
    async signIn(user, account, profile) {
      const existingUser = await client.fetch(AUTHOR_BY_ID_QUERY, {
        id: profile?.id
      });
      if (!existingUser) {
        await writeClient.create({
          _type: "author",
          _id: profile?.id,
          name: user?.name,
          username: profile?.login,
          email: user?.email,
          image: user?.image,
          bio: profile?.bio || ""
        });
      }
    },
    async redirect(url: string, baseUrl: string) {
      return baseUrl;
    },
    async jwt(token, account, profile) {
      if (account && profile) {
        const user = await client.fetch(AUTHOR_BY_ID_QUERY, {
          id: profile?.id
        });
        token.id = user._id;
      }
      return token;
    },
    async session({ session, token }) {
      Object.assign(session, { id: token.id });
      return session;
    }
  }
};

const { handlers, signIn, signOut, auth } = NextAuth(options);

export { handlers, signIn, signOut, auth };
