import NextAuth from 'next-auth/next';
import { options } from './options';
// @ts-expect-error next-auth

const handler = NextAuth(options);

export { handler as GET, handler as POST };
