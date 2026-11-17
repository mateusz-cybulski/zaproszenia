/**
 * Sign-in with Google Identity Platform (email and password).
 *
 * Read per request: Cloud Run injects FIREBASE_API_KEY at runtime, not during `next build`.
 * Not server-only, because proxy.ts reads it too; none of it is secret (the browser key is
 * public by design and restricted to this site).
 */
export const SESSION_COOKIE = "session";

export type FirebaseClientConfig = { apiKey: string; authDomain: string };

/**
 * Config for the Firebase JS SDK, or null when sign-in is disabled: only in local
 * development, where the API signs every request in as DEV_AUTH_USER.
 */
export function firebaseClientConfig(): FirebaseClientConfig | null {
  const apiKey = process.env.FIREBASE_API_KEY;
  if (apiKey) {
    return {
      apiKey,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? "",
    };
  }
  if (process.env.NODE_ENV === "development") {
    return null;
  }
  // Fail closed: production without sign-in configured must not serve the app.
  throw new Error("FIREBASE_API_KEY is not set");
}
