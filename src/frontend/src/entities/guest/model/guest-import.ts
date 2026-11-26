import type { z } from "zod";

import type { guestImportResultSchema } from "../api/guest-import-dto";

export type GuestImportResult = z.output<typeof guestImportResultSchema>;
export type ImportedGuest = GuestImportResult["preview"][number];
