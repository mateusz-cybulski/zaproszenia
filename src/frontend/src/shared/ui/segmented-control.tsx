"use client";

import { cn } from "@/shared/lib/css";

type SegmentedControlProps<Value extends string> = {
  label: string;
  name: string;
  options: readonly { value: Value; label: string }[];
  value: Value;
  onChange: (value: Value) => void;
  className?: string;
};

// A radio group drawn as buttons: one choice from a few, like the theme switcher.
export function SegmentedControl<Value extends string>({
  label,
  name,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<Value>) {
  return (
    <fieldset className={cn("flex w-fit gap-0.5 rounded-lg border border-border p-0.5", className)}>
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className="flex cursor-pointer items-center justify-center rounded-md px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground has-checked:bg-accent has-checked:text-accent-foreground has-focus-visible:ring-2 has-focus-visible:ring-ring"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
