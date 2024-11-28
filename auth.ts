import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
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
    // CredentialsProvider({
    //   name: "Credentials",
    //   credentials: {
    //     email: { label: "Email", type: "email" },
    //     password: { label: "Password", type: "password" }
    //   },
    //   async authorize(credentials) {
    //     if (!credentials) return null;
    //     const { email, password } = credentials;
    //     const user = await getUserByEmail(email);
    //     if (user && bcrypt.compareSync(password, user.passwordHash)) {
    //       return { id: user.id, name: user.name, email: user.email };
    //     } else {
    //       throw new Error("Invalid credentials");
    //     }
    //   }
    // })
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
  }
  // callbacks: {
  // ! only for google
  //   async signIn({ account, profile }) {
  //     if (account.provider === "google") {
  //       console.log("Google profile", profile);
  //       return profile.email_verified && profile.email.endsWith("@example.com");
  //     }
  //     return true; // !Do different verification for other providers that don't have `email_verified`
  //   }
  // }
};

const { handlers, signIn, signOut, auth } = NextAuth(options);

export { handlers, signIn, signOut, auth };
