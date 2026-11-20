"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { TemplateId } from "@/entities/template";
import { routes } from "@/shared/routes";

import { copyAndEditTemplateAction } from "../api/copy-and-edit-template-action";

// The copy replaces the system template in history: going back returns to the list.
export function useCopyAndEdit(id: TemplateId) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function copy() {
    setError(null);
    startTransition(async () => {
      const result = await copyAndEditTemplateAction(id);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.replace(routes.template(result.id), { scroll: false });
    });
  }

  return { copy, pending, error };
}
