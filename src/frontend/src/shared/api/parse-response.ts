import "server-only";

import type { z } from "zod";

// The API's JSON is checked against the schema, so a contract drift fails here, by field name.
export async function parseResponse<Schema extends z.ZodType>(
  response: Response,
  schema: Schema,
): Promise<z.output<Schema>> {
  return schema.parse(await response.json());
}
