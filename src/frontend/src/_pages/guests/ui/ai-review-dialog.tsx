"use client";

import { useState } from "react";

import { type AcceptedAiField, type Guest, recipientName } from "@/entities/guest";
import { useAction } from "@/shared/lib/action-call";
import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { acceptAiVerificationAction } from "../api/accept-ai-verification-action";
import { AI_FIELD_LABELS, AI_REVIEW_COPY as COPY } from "../config/ai-review-copy";
import { type AiReviewRow, aiReviewRows } from "../model/ai-review";

type AiReviewDialogProps = {
  guest: Guest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AiReviewDialog({ guest, open, onOpenChange }: AiReviewDialogProps) {
  const rows = aiReviewRows(guest);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{COPY.title}</DialogTitle>
          <DialogDescription>
            {recipientName(guest)}
            {guest.verificationResult?.summary && `: ${guest.verificationResult.summary}`}
          </DialogDescription>
        </DialogHeader>
        {open && <AiReviewForm guest={guest} rows={rows} close={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

// Mounted only while open, so every opening starts from AI's suggestions.
function AiReviewForm({
  guest,
  rows,
  close,
}: {
  guest: Guest;
  rows: AiReviewRow[];
  close: () => void;
}) {
  const [accepted, setAccepted] = useState<ReadonlySet<AcceptedAiField>>(
    () => new Set(rows.filter((row) => row.proposed !== null).map((row) => row.field)),
  );
  const accept = useAction(() => acceptAiVerificationAction(guest.id, [...accepted]), {
    onSuccess: close,
  });

  function toggle(field: AcceptedAiField, checked: boolean) {
    setAccepted((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(field);
      } else {
        next.delete(field);
      }
      return next;
    });
  }

  return (
    <DialogBody className="grid gap-4">
      <AddressCheckNotice guest={guest} />
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{COPY.noSuggestions}</p>
      ) : (
        <ul className="grid gap-3">
          {rows.map((row) => (
            <AiReviewItem
              key={row.field}
              row={row}
              checked={accepted.has(row.field)}
              onCheckedChange={(checked) => toggle(row.field, checked)}
            />
          ))}
        </ul>
      )}
      <p role="alert" className="text-sm text-destructive empty:hidden">
        {accept.error}
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={close}>
          {COPY.cancel}
        </Button>
        <Button type="button" pending={accept.pending} onClick={() => accept.run()}>
          {accept.pending ? COPY.pending : COPY.confirm}
        </Button>
      </div>
    </DialogBody>
  );
}

function AiReviewItem({
  row,
  checked,
  onCheckedChange,
}: {
  row: AiReviewRow;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const id = `ai-review-${row.field}`;

  return (
    <li
      data-status={row.status}
      className="grid gap-2 rounded-lg border p-3 data-[status=error]:border-destructive/40"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{AI_FIELD_LABELS[row.field]}</span>
        {row.proposed !== null && (
          <span className="flex items-center gap-2">
            <Checkbox
              id={id}
              checked={checked}
              onCheckedChange={(state) => onCheckedChange(state === true)}
            />
            <label htmlFor={id} className="text-sm">
              {COPY.accept}
            </label>
          </span>
        )}
      </div>
      <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm">
        <dt className="text-muted-foreground">{COPY.current}</dt>
        <dd className={cn(row.proposed !== null && checked && "line-through")}>
          {row.current ?? COPY.empty}
        </dd>
        {row.proposed !== null && (
          <>
            <dt className="text-muted-foreground">{COPY.proposed}</dt>
            <dd className="font-medium">{row.proposed}</dd>
          </>
        )}
      </dl>
      {row.explanation && <p className="text-xs text-muted-foreground">{row.explanation}</p>}
    </li>
  );
}

// Only a problem is worth a notice; the suggestions it leads to are among the fields above.
function AddressCheckNotice({ guest }: { guest: Guest }) {
  const check = guest.verificationResult?.addressCheck;
  if (!check || check.status === "ok" || check.status === "skipped") {
    return null;
  }
  return (
    <div
      data-status={check.status}
      className="grid gap-1 rounded-lg border border-warning/40 bg-warning/5 p-3 text-sm data-[status=error]:border-destructive/40 data-[status=error]:bg-destructive/5"
    >
      <span className="font-medium">{COPY.addressTitle}</span>
      <p>{check.explanation}</p>
      {check.matchedLabel && (
        <p className="text-xs text-muted-foreground">{COPY.addressFound(check.matchedLabel)}</p>
      )}
    </div>
  );
}
