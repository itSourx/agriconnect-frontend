import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define your public routes here.
const publicRoutes = [
  "/auth/login", // The actual login page
  "/api/auth/signin", // Necessary for NextAuth to work
  "/api/auth/callback", // Necessary for NextAuth to work
  "/api/auth/providers",
  "/api/auth/session",
  "/pages/login",
  "/pages/register"
];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  const session = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isLoggedIn = !!session;

  const isPublicRoute = publicRoutes.includes(url);

  // If it's a public route
  if (isPublicRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // If not a public route and not logged in, redirect to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

// Optionally, configure the matcher (more efficient)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/login (login page)
     * - pages/login (login page)
     * - pages/register (register page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|auth/login|pages/login|pages/register).*)",
  ],
};
