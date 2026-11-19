"use client";

import { Copy, Eye } from "lucide-react";

import type { Template } from "@/entities/template";
import { useAction } from "@/shared/lib/actions";
import { routes } from "@/shared/routes";
import { Button } from "@/shared/ui/button";

import { copyTemplateAction } from "../api/copy-template-action";
import { DeleteTemplateDialog } from "./delete-template-dialog";

export function TemplateActions({ template }: { template: Template }) {
  const copy = useAction(() => copyTemplateAction(template.id));

  return (
    <>
      <Button variant="outline" size="sm" asChild>
        <a href={routes.templatePreview(template.id)} target="_blank" rel="noreferrer">
          <Eye /> Podgląd
        </a>
      </Button>
      <Button variant="outline" size="sm" onClick={() => copy.run()} disabled={copy.pending}>
        <Copy /> {copy.pending ? "Kopiowanie…" : "Kopiuj"}
      </Button>
      {!template.isSystem && <DeleteTemplateDialog template={template} />}
      <p role="alert" className="w-full text-sm text-destructive empty:hidden">
        {copy.error}
      </p>
    </>
  );
}
