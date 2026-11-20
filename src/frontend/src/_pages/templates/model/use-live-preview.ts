"use client";

import { useEffect, useState } from "react";

import { type TemplateField, type TemplateId, templatePreviewBody } from "@/entities/template";
import { routes } from "@/shared/routes";

const PREVIEW_DELAY_MS = 350;

type LivePreview = { imageUrl: string | null; error: string | null; loading: boolean };

const PREVIEW_ERROR = "Nie udało się wczytać podglądu. Spróbuj ponownie.";

async function readError(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  if (
    typeof body === "object" &&
    body !== null &&
    "detail" in body &&
    typeof body.detail === "string"
  ) {
    return body.detail;
  }
  return PREVIEW_ERROR;
}

// The page rendered with the unsaved fields, refreshed a moment after the last change.
export function useLivePreview(templateId: TemplateId, fields: TemplateField[], page: number) {
  const [preview, setPreview] = useState<LivePreview>({
    imageUrl: null,
    error: null,
    loading: true,
  });
  const body = templatePreviewBody(fields, page);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setPreview((current) => ({ ...current, loading: true }));
      void fetch(routes.templatePreviewImage(templateId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            const error = await readError(response);
            setPreview((current) => ({ ...current, error, loading: false }));
            return;
          }
          const imageUrl = URL.createObjectURL(await response.blob());
          setPreview((current) => {
            if (current.imageUrl) {
              URL.revokeObjectURL(current.imageUrl);
            }
            return { imageUrl, error: null, loading: false };
          });
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setPreview((current) => ({ ...current, error: PREVIEW_ERROR, loading: false }));
          }
        });
    }, PREVIEW_DELAY_MS);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [templateId, body]);

  return preview;
}
