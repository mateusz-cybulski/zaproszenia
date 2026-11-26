import type { Guest } from "@/entities/guest";

import { DeleteGuestDialog } from "./delete-guest-dialog";

export function GuestRowActions({ guest }: { guest: Guest }) {
  return (
    <div className="flex items-center justify-end">
      <DeleteGuestDialog guest={guest} />
    </div>
  );
}
