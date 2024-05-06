import { auth } from '@/auth';

export { auth as middleware } from '@/auth';

export default auth((req) => {
  const { nextUrl } = req;

  const isAuthenticated = !!req.auth;

  if (!isAuthenticated) {
    return Response.redirect(new URL('/api/auth/signin', nextUrl));
  }
});

export const config = {
  matcher: ['/((?!api|trpc|_next/static|_next/image|favicon.ico).*)'],
};
