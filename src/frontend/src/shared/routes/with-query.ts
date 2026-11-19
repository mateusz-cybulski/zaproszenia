// A path with query parameters; undefined and empty values are left out of the URL.
export function withQuery(
  path: string,
  params: Record<string, string | number | undefined>,
): string {
  const query = new URLSearchParams();
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(name, String(value));
    }
  }
  const search = query.toString();
  return search ? `${path}?${search}` : path;
}
