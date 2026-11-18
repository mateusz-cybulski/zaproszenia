"use client";

import { Trash } from "lucide-react";
import { useState, useTransition } from "react";

import type { Template } from "@/entities/template";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

import { deleteTemplateAction } from "../api/delete-template-action";

export function DeleteTemplateDialog({ template }: { template: Template }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    setError(null);
  }

  function confirm() {
    startTransition(async () => {
      const result = await deleteTemplateAction(template.id);
      if (result.error) {
        setError(result.error);
      } else {
        changeOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="ml-auto">
          <Trash /> Usuń
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Usunąć szablon „{template.name}”?</DialogTitle>
          <DialogDescription>Szablon i jego plik PDF zostaną usunięte na stałe.</DialogDescription>
        </DialogHeader>
        <p role="alert" className="text-sm text-destructive empty:hidden">
          {error}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => changeOpen(false)}>
            Anuluj
          </Button>
          <Button variant="destructive" onClick={confirm} disabled={pending}>
            <Trash /> {pending ? "Usuwanie…" : "Usuń"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
