import "server-only";

/**
 * Base URL of the API service. Cloud Run injects API_URL at runtime, so call this per
 * request (never at module level, which would run during `next build`).
 */
export function apiUrl(): string {
  const url =
    process.env.API_URL ??
    (process.env.NODE_ENV === "development" ? "http://localhost:8000" : undefined);
  if (!url) {
    throw new Error("API_URL is not set");
  }
  return url;
}
