import { z } from "zod";

const importedGuestSchema = z
  .object({
    full_name: z.string().nullable(),
    position: z.string().nullable(),
    institution: z.string().nullable(),
    street: z.string().nullable(),
    postal_code: z.string().nullable(),
    city: z.string().nullable(),
    country: z.string(),
  })
  .transform((guest) => ({
    fullName: guest.full_name,
    position: guest.position,
    institution: guest.institution,
    street: guest.street,
    postalCode: guest.postal_code,
    city: guest.city,
    country: guest.country,
  }));

export const guestImportResultSchema = z
  .object({
    dry_run: z.boolean(),
    total_rows: z.int(),
    ready: z.int(),
    created: z.int(),
    duplicates: z.array(
      z.object({
        row: z.int(),
        full_name: z.string().nullable(),
        institution: z.string().nullable(),
      }),
    ),
    errors: z.array(z.object({ row: z.int(), errors: z.array(z.string()) })),
    mapped_columns: z.record(z.string(), z.string()),
    unmapped_columns: z.array(z.string()),
    preview: z.array(importedGuestSchema),
  })
  .transform((result) => ({
    dryRun: result.dry_run,
    totalRows: result.total_rows,
    ready: result.ready,
    created: result.created,
    duplicates: result.duplicates.map((duplicate) => ({
      row: duplicate.row,
      name: duplicate.full_name ?? duplicate.institution ?? "",
    })),
    errors: result.errors,
    mappedColumns: result.mapped_columns,
    unmappedColumns: result.unmapped_columns,
    preview: result.preview,
  }));
