import { MapPinOff } from "lucide-react";
import type { ReactNode } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { ABOVE_ROW_LINK, ROW_WITH_LINK, TableRowLink } from "@/shared/ui/table-row-link";

import { formatAddress } from "@/shared/lib/address";
import { cn } from "@/shared/lib/css";
import { Badge } from "@/shared/ui/badge";

import { type Guest, hasPostalAddress, recipientName } from "../model/guest";
import { VerificationBadge } from "./verification-badge";

type GuestTableProps = {
  guests: Guest[];
  emptyMessage: string;
  // Opens the guest: the name is the link and its click area covers the whole row.
  hrefFor?: (guest: Guest) => string;
  // A selection column: its header (e.g. "select the page") and the cell of each row.
  selectionHeader?: ReactNode;
  renderSelection?: (guest: Guest) => ReactNode;
  renderVerification?: (guest: Guest) => ReactNode;
  renderActions?: (guest: Guest) => ReactNode;
};

export function GuestTable({
  guests,
  emptyMessage,
  hrefFor,
  selectionHeader,
  renderSelection,
  renderVerification,
  renderActions,
}: GuestTableProps) {
  if (guests.length === 0) {
    return <p className="p-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {renderSelection && <TableHead className="w-10">{selectionHeader}</TableHead>}
          <TableHead>Adresat</TableHead>
          <TableHead>Stanowisko i instytucja</TableHead>
          <TableHead>Adres</TableHead>
          <TableHead>Weryfikacja</TableHead>
          {renderActions && (
            <TableHead className="text-right">
              <span className="sr-only">Akcje</span>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {guests.map((guest) => {
          const name = recipientName(guest);
          // Without a person the institution is already the recipient; do not repeat it.
          const affiliation = [guest.position, guest.fullName ? guest.institution : null]
            .filter(Boolean)
            .join(", ");
          const address = formatAddress(guest);
          return (
            <TableRow key={guest.id} className={cn(hrefFor && ROW_WITH_LINK)}>
              {renderSelection && (
                <TableCell className={ABOVE_ROW_LINK}>{renderSelection(guest)}</TableCell>
              )}
              <TableCell className="font-medium">
                {hrefFor ? <TableRowLink href={hrefFor(guest)}>{name}</TableRowLink> : name}
                {guest.salutation && (
                  <span className="block text-xs font-normal text-muted-foreground">
                    {guest.salutation}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">{affiliation || "—"}</TableCell>
              <TableCell className="text-muted-foreground">
                {hasPostalAddress(guest) ? (
                  address
                ) : (
                  <span className="grid justify-items-start gap-1">
                    {address && <span>{address}</span>}
                    <Badge
                      variant="outline"
                      className="border-warning/30 bg-warning/10 text-warning"
                    >
                      <MapPinOff aria-hidden /> Brak adresu
                    </Badge>
                  </span>
                )}
              </TableCell>
              <TableCell className={cn(renderVerification && ABOVE_ROW_LINK)}>
                {renderVerification ? (
                  renderVerification(guest)
                ) : (
                  <VerificationBadge status={guest.verificationStatus} />
                )}
              </TableCell>
              {renderActions && (
                <TableCell className={cn("text-right", ABOVE_ROW_LINK)}>
                  {renderActions(guest)}
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
