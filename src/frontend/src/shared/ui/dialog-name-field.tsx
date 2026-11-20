"use client";

import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/css";
import { DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";

type DialogNameFieldProps = Omit<ComponentProps<"input">, "aria-label"> & {
  label: string;
  // What screen readers announce as the dialog's name; the input shows the name being edited.
  title: string;
  error?: string;
  errorId?: string;
};

// The name of what a dialog edits, in the middle of DialogTitleBar instead of a title.
export function DialogNameField({
  label,
  title,
  error,
  errorId,
  className,
  ...props
}: DialogNameFieldProps) {
  return (
    <div className="grid justify-items-center gap-1">
      <DialogTitle className="sr-only">{title}</DialogTitle>
      <Input
        aria-label={label}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        autoComplete="off"
        className={cn("h-9 w-72 text-center text-base font-medium md:text-base", className)}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
