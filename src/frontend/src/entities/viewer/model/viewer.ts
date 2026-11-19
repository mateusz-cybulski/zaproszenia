import type { z } from "zod";

import type { viewerDtoSchema } from "../api/viewer-dto";

export type Viewer = z.output<typeof viewerDtoSchema>;
