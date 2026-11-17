import "server-only";

import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/shared/config";

export async function readSessionCookie(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/** Only in Server Actions and Route Handlers (cookies cannot change while rendering). */
export async function writeSessionCookie(value: string, maxAgeSeconds: number): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

/** Only in Server Actions and Route Handlers. */
export async function deleteSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
