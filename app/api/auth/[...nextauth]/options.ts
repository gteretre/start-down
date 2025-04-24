import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { getAuthorById, getAuthorByEmail } from '@/lib/queries';
import { createAuthor } from '@/lib/mutations';
export const options = {
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      async profile(profile) {
        const isAdmin = profile?.email === process.env?.ADMIN;
        return {
          ...profile,
          role: isAdmin ? 'admin' : 'GithubUser',
          username: profile.login,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      async profile(profile) {
        const isAdmin = profile?.email === process.env?.ADMIN;
        const username = profile.email?.split('@')[0] || null; // since google doesn't provide a username in the profile
        return {
          ...profile,
          id: profile.sub,
          role: isAdmin ? 'admin' : 'GoogleUser',
          username,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      if (typeof window !== 'undefined' || !user?.email) return false;

      let dbUser = null;
      try {
        dbUser = await getAuthorById(profile.id);
      } catch (err) {
        console.error('Error in getAuthorById:', err);
      }
      if (!dbUser) {
        try {
          dbUser = await getAuthorByEmail(user.email);
        } catch (err) {
          console.error('Error in getAuthorByEmail:', err);
        }
      }

      if (!dbUser) {
        const image = profile.avatar_url || profile.picture || user.image || '/logo.png';
        const username =
          profile?.login ||
          (user.email ? user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') : null) ||
          `user_${Date.now().toString().slice(-6)}`;
        try {
          await createAuthor({
            id: profile.id,
            name: user.name,
            username,
            email: user.email,
            image,
            bio: '',
            createdAt: new Date().toISOString(),
            role: user.role,
          });
        } catch (err) {
          console.error('Failed to create user', err);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.role = token.role;
      session.user.username = token.username;
      return session;
    },
  },
};
