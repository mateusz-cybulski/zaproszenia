import "server-only";

// Cloud Run sets API_URL only at runtime: call this per request, never at module level
// (that runs during `next build`).
export function apiUrl(): string {
  const url =
    process.env.API_URL ??
    (process.env.NODE_ENV === "development" ? "http://localhost:8000" : undefined);
  if (!url) {
    throw new Error("API_URL is not set");
  }
  return url;
}
