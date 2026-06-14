import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Protected paths that require a user to be logged in
  const protectedPatterns = [
    /^\/profile(\/.*)?$/,
    /^\/admin(\/.*)?$/,
    /^\/moderation(\/.*)?$/,
    /^\/ask(\/.*)?$/,
    /^\/logout(\/.*)?$/,
    /^\/posts\/[^/]+(\/.*)?$/,
    /^\/comment\/[^/]+(\/.*)?$/,
  ];

  // Guest-only paths (redirect to home if already logged in)
  const guestOnlyPaths = ["/login", "/register"];

  const isProtected = protectedPatterns.some((pattern) => pattern.test(pathname));
  const isGuestOnly = guestOnlyPaths.includes(pathname);

  if (!token && isProtected) {
    // Redirect to login if accessing a protected page while not logged in
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isGuestOnly) {
    // Redirect to home if already logged in and trying to access login/register
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, assets, manifest, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public|site\\.webmanifest|.*\\..*).*)",
  ],
};
