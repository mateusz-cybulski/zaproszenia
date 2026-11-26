import type { GuestImportResult } from "@/entities/guest";
import { formatAddress } from "@/shared/lib/address";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

import { IMPORT_COPY as COPY } from "../config/import-copy";

const ERRORS_SHOWN = 20;

export function ImportSummary({ result }: { result: GuestImportResult }) {
  const shownErrors = result.errors.slice(0, ERRORS_SHOWN);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      <dl className="grid grid-cols-3 gap-3 text-sm">
        <Count label={COPY.ready} value={result.ready} />
        <Count label={COPY.duplicates} value={result.duplicates.length} />
        <Count label={COPY.errors} value={result.errors.length} />
      </dl>

      {result.unmappedColumns.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {COPY.skippedColumns(result.unmappedColumns.join(", "))}
        </p>
      )}

      {shownErrors.length > 0 && (
        <section className="grid gap-1 rounded-lg border border-destructive/40 p-3 text-sm">
          <h3 className="font-medium">{COPY.errors}</h3>
          <ul className="grid gap-1">
            {shownErrors.map((rowError) => (
              <li key={rowError.row}>
                <span className="font-medium">{COPY.row(rowError.row)}:</span>{" "}
                {rowError.errors.join(" ")}
              </li>
            ))}
          </ul>
          {result.errors.length > ERRORS_SHOWN && (
            <p className="text-muted-foreground">
              {COPY.moreErrors(result.errors.length - ERRORS_SHOWN)}
            </p>
          )}
        </section>
      )}

      {result.duplicates.length > 0 && (
        <details className="rounded-lg border p-3 text-sm">
          <summary className="cursor-pointer font-medium">{COPY.duplicates}</summary>
          <ul className="mt-2 grid gap-1">
            {result.duplicates.map((duplicate) => (
              <li key={duplicate.row}>
                {COPY.row(duplicate.row)}: {duplicate.name}
              </li>
            ))}
          </ul>
        </details>
      )}

      {result.preview.length > 0 && (
        <div className="rounded-lg border">
          <Table>
            <caption className="caption-top p-3 text-left text-sm text-muted-foreground">
              {COPY.previewCaption(result.preview.length, result.ready)}
            </caption>
            <TableHeader>
              <TableRow>
                <TableHead>{COPY.recipient}</TableHead>
                <TableHead>{COPY.affiliation}</TableHead>
                <TableHead>{COPY.address}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.preview.map((guest, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium whitespace-normal">
                    {guest.fullName ?? guest.institution}
                  </TableCell>
                  <TableCell className="whitespace-normal text-muted-foreground">
                    {[guest.position, guest.fullName ? guest.institution : null]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </TableCell>
                  <TableCell className="whitespace-normal text-muted-foreground">
                    {formatAddress(guest)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid gap-0.5 rounded-lg border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
