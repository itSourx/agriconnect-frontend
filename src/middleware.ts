import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const publicRoutes = [
  "/auth/login",
  "/api/auth/signin",
  "/api/auth/callback",
  "/api/auth/providers",
  "/api/auth/session",
  "/pages/login",
  "/pages/register",
];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  const session = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isLoggedIn = !!session;

  const isPublicRoute = publicRoutes.includes(url);

  if (isPublicRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|auth/login|pages/login|pages/register).*)",
  ],
};