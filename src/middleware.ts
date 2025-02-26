import { auth } from "@/auth";
import { NextRequest, NextResponse, NextFetchEvent } from "next/server";

// Define your public routes here (these routes will be accessible without authentication).
const publicRoutes = [
  
  "/api/auth", // this is important, so that nextauth can work
  "/sign-in"
];

export default auth(async (req: NextRequest, event: NextFetchEvent) => {
    const url = req.nextUrl.pathname
    if(publicRoutes.includes(url)){
      return NextResponse.next();
    }
    return NextResponse.next();
});

// Optionally, configure the matcher (more efficient)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
