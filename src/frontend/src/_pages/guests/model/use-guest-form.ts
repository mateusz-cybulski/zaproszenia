"use client";

import type { Guest } from "@/entities/guest";
import { useServerForm } from "@/shared/lib/server-form";

import { createGuestAction } from "../api/create-guest-action";
import { updateGuestAction } from "../api/update-guest-action";
import { guestFormDefaults, guestFormSchema } from "./guest-form";

// Owned by the dialog: the name field and the save button sit in its header, outside the <form>.
export function useGuestForm(guest: Guest | undefined, onSaved: () => void) {
  return useServerForm({
    schema: guestFormSchema,
    action: guest ? updateGuestAction.bind(null, guest.id) : createGuestAction,
    defaultValue: guestFormDefaults(guest),
    onSuccess: onSaved,
  });
}

export type GuestFormState = ReturnType<typeof useGuestForm>;
