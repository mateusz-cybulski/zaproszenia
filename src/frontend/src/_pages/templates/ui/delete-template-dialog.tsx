"use client";

import { Trash } from "lucide-react";

import type { Template } from "@/entities/template";
import { Button } from "@/shared/ui/button";
import { ConfirmActionDialog } from "@/shared/ui/confirm-action-dialog";

import { deleteTemplateAction } from "../api/delete-template-action";

export function DeleteTemplateDialog({ template }: { template: Template }) {
  return (
    <ConfirmActionDialog
      trigger={
        <Button variant="destructive" size="sm" className="ml-auto">
          <Trash /> Usuń
        </Button>
      }
      title={`Usunąć szablon „${template.name}”?`}
      description="Szablon i jego plik PDF zostaną usunięte na stałe."
      tone="destructive"
      confirmLabel={
        <>
          <Trash /> Usuń
        </>
      }
      pendingLabel={
        <>
          <Trash /> Usuwanie…
        </>
      }
      action={() => deleteTemplateAction(template.id)}
    />
  );
}
