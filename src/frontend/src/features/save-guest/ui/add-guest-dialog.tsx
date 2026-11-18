"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

import { GuestForm } from "./guest-form";

export function AddGuestDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Dodaj gościa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Dodaj gościa</DialogTitle>
          <DialogDescription>
            Podaj imię i nazwisko albo samą instytucję, jeśli zapraszasz ją jako całość.
          </DialogDescription>
        </DialogHeader>
        <GuestForm onCreated={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
