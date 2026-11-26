"use client";

import { FileUp } from "lucide-react";
import { useId, useState } from "react";

import type { GuestImportResult } from "@/entities/guest";
import { useAction } from "@/shared/lib/action-call";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { importGuestsAction } from "../api/import-guests-action";
import { IMPORT_ACCEPT, IMPORT_COPY as COPY } from "../config/import-copy";
import { ImportSummary } from "./import-summary";

function fileData(file: File): FormData {
  const formData = new FormData();
  formData.set("file", file);
  return formData;
}

export function ImportGuestsDialog() {
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<GuestImportResult | null>(null);

  // The file is sent twice: checked first, saved after the preview. The API keeps nothing between.
  const check = useAction(async (chosen: File) => {
    const outcome = await importGuestsAction(fileData(chosen), true);
    if (outcome.error === undefined) {
      setResult(outcome.result);
    }
    return { error: outcome.error };
  });
  const save = useAction(
    async (chosen: File) => {
      const outcome = await importGuestsAction(fileData(chosen), false);
      return { error: outcome.error };
    },
    { onSuccess: () => changeOpen(false) },
  );

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setFile(null);
      setResult(null);
      check.setError(null);
      save.setError(null);
    }
  }

  function chooseFile(chosen: File | null) {
    setFile(chosen);
    setResult(null);
    check.setError(null);
    save.setError(null);
  }

  const error = check.error ?? save.error;

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" icon={<FileUp />}>
          {COPY.trigger}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{COPY.title}</DialogTitle>
          <DialogDescription>{COPY.description}</DialogDescription>
        </DialogHeader>
        <DialogBody className="grid grid-cols-[minmax(0,1fr)] gap-4">
          <div className="grid gap-2">
            <Label htmlFor={inputId} required>
              {COPY.fileLabel}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id={inputId}
                type="file"
                accept={IMPORT_ACCEPT}
                onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
              />
              <Button
                type="button"
                variant="outline"
                pending={check.pending}
                aria-disabled={!file || save.pending}
                onClick={() => file && check.run(file)}
              >
                {check.pending ? COPY.checking : COPY.check}
              </Button>
            </div>
          </div>

          {result && <ImportSummary result={result} />}

          <p role="alert" className="text-sm text-destructive empty:hidden">
            {error}
          </p>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => changeOpen(false)}>
              {COPY.cancel}
            </Button>
            {result && (
              <Button
                type="button"
                pending={save.pending}
                aria-disabled={result.ready === 0 || !file}
                onClick={() => file && save.run(file)}
              >
                {save.pending ? COPY.saving : COPY.save(result.ready)}
              </Button>
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
