"use client";

import { Upload } from "lucide-react";
import { useState } from "react";

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

import { UploadTemplateForm } from "./upload-template-form";

export function UploadTemplateDialog() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload /> Wgraj PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Wgraj szablon PDF</DialogTitle>
          <DialogDescription>
            Projekt zaproszenia lub koperty (np. od grafika albo drukarni) bez danych gości. Pola z
            imieniem, zwrotem i adresem ułożysz na nim później.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <UploadTemplateForm onUploaded={close} onCancel={close} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
