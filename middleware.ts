export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    /*
     * Protect all routes EXCEPT:
     *  - /login
     *  - /api/auth/* (NextAuth callbacks)
     *  - /_next/* (Next.js internals)
     *  - /favicon.ico, /robots.txt, /sitemap.xml
     */
    '/((?!login|api/auth|_next/static|_next/image|favicon\\.ico|robots\\.txt).*)',
  ],
};
