import { type NextRequest, NextResponse } from "next/server";

import { firebaseClientConfig, SESSION_COOKIE } from "@/shared/config";
import { routes } from "@/shared/routes";

/**
 * Sends visitors without a session cookie to the home page, which shows the sign-in form.
 * Only checks that the cookie exists (fast, no network): the API verifies the session on
 * every request, and a 401 from it also leads back to the home page.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE) || !firebaseClientConfig()) {
    return NextResponse.next();
  }
  return NextResponse.redirect(publicUrl(request, routes.home()));
}

/**
 * The address the browser used. Behind Cloud Run, request.url and nextUrl point at the
 * container itself (e.g. http://0.0.0.0:8080), so take host and scheme from the headers.
 */
function publicUrl(request: NextRequest, path: string): URL {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol;
  if (!host) {
    return new URL(path, request.url);
  }
  return new URL(path, `${protocol.replace(/:$/, "")}://${host}`);
}

export const config = {
  // Every page except the home page itself, Next.js assets and public files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).+)"],
};
