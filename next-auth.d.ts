declare module 'next-auth' {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      username?: string;
      id?: string;
      termsAcceptedAt?: string | undefined;
    };
  }

  interface JWT {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    username?: string;
    termsAcceptedAt?: string | undefined;
  }
}
