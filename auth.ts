import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

const options = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    })
  ]
};

const { handlers, signIn, signOut, auth } = NextAuth(options);

export { handlers, signIn, signOut, auth };
