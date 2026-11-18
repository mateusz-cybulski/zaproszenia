import { z } from "zod";

export const templateIdSchema = z.int().positive();
