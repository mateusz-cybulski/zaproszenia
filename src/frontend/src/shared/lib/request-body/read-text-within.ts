// The text of a request body, or null when it is larger than maxBytes. It stops reading at the
// limit instead of buffering whatever the caller sends; Content-Length can be missing or wrong.
export async function readTextWithin(request: Request, maxBytes: number): Promise<string | null> {
  if (Number(request.headers.get("Content-Length")) > maxBytes) {
    return null;
  }
  if (!request.body) {
    return "";
  }
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}
