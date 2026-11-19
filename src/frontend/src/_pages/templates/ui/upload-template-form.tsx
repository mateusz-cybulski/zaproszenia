"use client";

import { Upload } from "lucide-react";
import { type FormEvent, useState } from "react";

import { templateKindLabels, templateKinds } from "@/entities/template";
import { useAction } from "@/shared/lib/actions";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { NativeSelect } from "@/shared/ui/native-select";

import { uploadTemplateAction } from "../api/upload-template-action";
import { FILE_TOO_LARGE } from "../config/messages";
import { MAX_NAME_LENGTH, MAX_PDF_BYTES, MAX_PDF_MEGABYTES, PDF_ACCEPT } from "../config/upload";
import { nameFromFile } from "../model/upload-template";

type UploadTemplateFormProps = { onUploaded: () => void; onCancel: () => void };

export function UploadTemplateForm({ onUploaded, onCancel }: UploadTemplateFormProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const { run, pending, error, setError } = useAction(uploadTemplateAction, {
    onSuccess: onUploaded,
  });

  // Not a form action: React would reset the form after an error and drop the chosen file.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get("file");
    if (file instanceof File && file.size > MAX_PDF_BYTES) {
      setError(FILE_TOO_LARGE);
      return;
    }
    run(formData);
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="template-file">Plik PDF</Label>
        <Input
          id="template-file"
          name="file"
          type="file"
          accept={PDF_ACCEPT}
          required
          aria-describedby="template-file-hint"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
        />
        <p id="template-file-hint" className="text-sm text-muted-foreground">
          Do 4 stron i {MAX_PDF_MEGABYTES} MB.
        </p>
      </div>
      <div className="grid grid-cols-[1fr_12rem] gap-4">
        <div className="grid gap-2">
          <Label htmlFor="template-name">Nazwa</Label>
          <Input
            id="template-name"
            name="name"
            maxLength={MAX_NAME_LENGTH}
            placeholder={fileName ? nameFromFile(fileName) : "Zaproszenie na galę"}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="template-kind">Rodzaj</Label>
          <NativeSelect id="template-kind" name="kind" defaultValue="invitation">
            {templateKinds.map((kind) => (
              <option key={kind} value={kind}>
                {templateKindLabels[kind]}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>
      <p role="alert" className="text-sm text-destructive empty:hidden">
        {error}
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Anuluj
        </Button>
        <Button type="submit" disabled={pending}>
          <Upload /> {pending ? "Wgrywanie…" : "Wgraj"}
        </Button>
      </div>
    </form>
  );
}
