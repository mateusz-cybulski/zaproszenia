// An API that knows nobody: the sign-in pages render as for a visitor without a session.
import { createServer } from "node:http";

const MOCK_API_PORT = 8099;

createServer((_request, response) => {
  response.writeHead(401, { "Content-Type": "application/json" });
  response.end('{"detail":"unauthorized"}');
}).listen(MOCK_API_PORT, "127.0.0.1");
