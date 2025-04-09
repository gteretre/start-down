import NextAuth from "next-auth";

import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  getAuthorById,
  getAuthorByEmail,
  createAuthor
} from "@/lib/mongodb-service";
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
  ], // session: {
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

        // Try to find existing user by ID
        let existingUser = await getAuthorById(profile.id || user.id);

        // If not found by ID, try by email
        if (!existingUser) {
          existingUser = await getAuthorByEmail(user.email);
        }

        // If user doesn't exist, create a new one
        if (!existingUser) {
          await createAuthor({
            id: profile.id || user.id,
            name: user?.name,
            username: profile?.login || user.email.split("@")[0], // Fallback username if login not available
            email: user?.email,
            image: user?.image,
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
          const user = await getAuthorById(
            profile?.id || account?.providerAccountId
          );
          if (user) {
            token.user = {
              id: user.id,
              email: user.email,
              name: user.name,
              username: user.username,
              image: user.image
            };
          } else {
            console.error("User not found for the given token");
            token.error = "TokenIncorrect";
          }
        }
      } catch (error) {
        console.error("Error during JWT token generation:", error);
        token.error = "TokenIncorrect";
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token.error === "TokenIncorrect") {
        if (typeof window !== "undefined") {
          alert("Token incorrect. Logging out...");
          await signOut({ redirect: false });
        }
        return null;
      }

      const user = token.user || token.token?.user;
      if (user) {
        session.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          image: user.image
        };
      } else {
        console.error("User data is missing in the token");
      }
      return session;
    }
  }
};

const { handlers, signIn, signOut, auth } = NextAuth(options);

export { handlers, signIn, signOut, auth };
