import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;       // Google sub (unique user ID)
    } & DefaultSession['user'];
  }
}
