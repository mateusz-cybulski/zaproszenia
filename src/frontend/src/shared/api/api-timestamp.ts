import { z } from "zod";

// FastAPI writes aware datetimes as ISO 8601 with "Z" or an offset.
export const apiTimestamp = z.iso.datetime({ offset: true });
