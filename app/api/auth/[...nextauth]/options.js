import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import {
  getAuthorById,
  getAuthorByEmail,
  createAuthor
} from "@/lib/mongodb-service";

export const options = {
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      async profile(profile) {
        const isAdmin = profile?.email === process.env?.ADMIN;
        return {
          ...profile,
          role: isAdmin ? "admin" : "GithubUser",
          username: profile.login
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      async profile(profile) {
        const isAdmin = profile?.email === process.env?.ADMIN;
        const username = profile.email?.split("@")[0] || null; // since google doesn't provide a username in the profile
        return {
          ...profile,
          id: profile.sub,
          role: isAdmin ? "admin" : "GoogleUser",
          username
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, profile }) {
      if (typeof window !== "undefined" || !user?.email) return false;

      let dbUser = null;
      try {
        dbUser = await getAuthorById(profile?.id || user.id);
      } catch {}
      if (!dbUser) {
        try {
          dbUser = await getAuthorByEmail(user.email);
        } catch {}
      }

      if (!dbUser) {
        const username =
          profile?.login ||
          user.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") ||
          `user_${Date.now().toString().slice(-6)}`;
        try {
          await createAuthor({
            id: profile?.id || user.id,
            name: user.name || username,
            username,
            email: user.email,
            image: "public/logo.png",
            bio: "",
            createdAt: new Date().toISOString()
          });
        } catch (err) {
          console.error("Failed to create user", err);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.role = token.role;
      session.user.username = token.username;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.image;
      return session;
    }
  }
};


