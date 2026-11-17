import { type NextRequest, NextResponse } from "next/server";

import { firebaseClientConfig, SESSION_COOKIE } from "@/shared/config";
import { routes } from "@/shared/routes";

// Only checks that the cookie exists (no network): the API verifies the session itself.
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE) || !firebaseClientConfig()) {
    return NextResponse.next();
  }
  return NextResponse.redirect(publicUrl(request, routes.home()));
}

// Behind Cloud Run, request.url and nextUrl point at the container itself
// (e.g. http://0.0.0.0:8080), so take host and scheme from the headers.
function publicUrl(request: NextRequest, path: string): URL {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol;
  if (!host) {
    return new URL(path, request.url);
  }
  return new URL(path, `${protocol.replace(/:$/, "")}://${host}`);
}

export const config = {
  matcher: ["/((?!register$|_next/static|_next/image|favicon.ico|robots.txt).+)"],
};
