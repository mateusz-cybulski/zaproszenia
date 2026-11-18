"use client";

import { Copy, Eye } from "lucide-react";
import { useState, useTransition } from "react";

import type { Template } from "@/entities/template";
import { routes } from "@/shared/routes";
import { Button } from "@/shared/ui/button";

import { copyTemplateAction } from "../api/copy-template-action";
import { DeleteTemplateDialog } from "./delete-template-dialog";

export function TemplateActions({ template }: { template: Template }) {
  const [error, setError] = useState<string | null>(null);
  const [copying, startCopy] = useTransition();

  function copy() {
    setError(null);
    startCopy(async () => {
      const result = await copyTemplateAction(template.id);
      setError(result.error ?? null);
    });
  }

  return (
    <>
      <Button variant="outline" size="sm" asChild>
        <a href={routes.templatePreview(template.id)} target="_blank" rel="noreferrer">
          <Eye /> Podgląd
        </a>
      </Button>
      <Button variant="outline" size="sm" onClick={copy} disabled={copying}>
        <Copy /> {copying ? "Kopiowanie…" : "Kopiuj"}
      </Button>
      {!template.isSystem && <DeleteTemplateDialog template={template} />}
      <p role="alert" className="w-full text-sm text-destructive empty:hidden">
        {error}
      </p>
    </>
  );
}
