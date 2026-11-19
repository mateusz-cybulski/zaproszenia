"use client";

import { type ChangeEvent, useId, useState } from "react";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

type NumberFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

function isWithin(text: string, min: number, max: number): boolean {
  const value = Number(text);
  return text.trim() !== "" && Number.isFinite(value) && value >= min && value <= max;
}

// Keeps what is typed until it is a valid number ("1." or an empty box on the way to "12"),
// and shows the last valid value again on blur.
export function NumberField({ label, value, min, max, step, onChange }: NumberFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const text = event.target.value;
    setDraft(text);
    if (isWithin(text, min, max)) {
      onChange(Number(text));
    }
  }

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={draft ?? String(value)}
        aria-invalid={draft !== null && !isWithin(draft, min, max)}
        onChange={handleChange}
        onBlur={() => setDraft(null)}
      />
    </div>
  );
}
