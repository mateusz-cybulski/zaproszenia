"use client";

import { Copy, PencilLine } from "lucide-react";
import Link from "next/link";

import type { Template } from "@/entities/template";
import { useAction } from "@/shared/lib/action-call";
import { routes } from "@/shared/routes";
import { Button } from "@/shared/ui/button";

import { copyTemplateAction } from "../api/copy-template-action";
import { DeleteTemplateDialog } from "./delete-template-dialog";

export function TemplateActions({ template }: { template: Template }) {
  const copy = useAction(() => copyTemplateAction(template.id));

  return (
    <>
      <Button variant="outline" size="sm" asChild>
        <Link href={routes.template(template.id)} scroll={false}>
          <PencilLine /> {template.isSystem ? "Pola" : "Edytuj"}
        </Link>
      </Button>
      <Button variant="outline" size="sm" onClick={() => copy.run()} aria-disabled={copy.pending}>
        <Copy /> {copy.pending ? "Kopiowanie…" : "Kopiuj"}
      </Button>
      {!template.isSystem && <DeleteTemplateDialog template={template} />}
      <p role="alert" className="w-full text-sm text-destructive empty:hidden">
        {copy.error}
      </p>
    </>
  );
}
