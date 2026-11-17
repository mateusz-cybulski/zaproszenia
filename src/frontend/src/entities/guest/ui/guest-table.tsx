import Link from "next/link";

import { routes } from "@/shared/routes";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

import type { Guest } from "../model/guest";

export function GuestTable({ guests }: { guests: Guest[] }) {
  if (guests.length === 0) {
    return <p className="text-sm text-muted-foreground">Nie dodano jeszcze żadnych gości.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Imię i nazwisko</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead className="text-right">
            <span className="sr-only">Akcje</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {guests.map((guest) => (
          <TableRow key={guest.id}>
            <TableCell className="font-medium">{guest.name}</TableCell>
            <TableCell className="text-muted-foreground">{guest.email ?? "—"}</TableCell>
            <TableCell className="text-right">
              <Button asChild variant="outline" size="sm">
                <Link href={routes.guestEdit(guest.id)}>
                  Edytuj<span className="sr-only"> {guest.name}</span>
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
