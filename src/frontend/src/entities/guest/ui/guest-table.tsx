import Link from "next/link";
import type { ReactNode } from "react";

import { routes } from "@/shared/routes";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

import { formatAddress, type Guest, recipientName } from "../model/guest";
import { VerificationBadge } from "./verification-badge";

type GuestTableProps = {
  guests: Guest[];
  emptyMessage: string;
  renderVerification?: (guest: Guest) => ReactNode;
};

export function GuestTable({ guests, emptyMessage, renderVerification }: GuestTableProps) {
  if (guests.length === 0) {
    return <p className="p-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Adresat</TableHead>
          <TableHead>Stanowisko i instytucja</TableHead>
          <TableHead>Adres</TableHead>
          <TableHead>Weryfikacja</TableHead>
          <TableHead className="text-right">
            <span className="sr-only">Akcje</span>
          </TableHead>
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
            <TableRow key={guest.id}>
              <TableCell className="font-medium">
                {name}
                {guest.salutation && (
                  <span className="block text-xs font-normal text-muted-foreground">
                    {guest.salutation}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">{affiliation || "—"}</TableCell>
              <TableCell className="text-muted-foreground">{address || "—"}</TableCell>
              <TableCell>
                {renderVerification ? (
                  renderVerification(guest)
                ) : (
                  <VerificationBadge status={guest.verificationStatus} />
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="outline" size="sm">
                  <Link href={routes.guestEdit(guest.id)}>
                    Edytuj<span className="sr-only"> {name}</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
