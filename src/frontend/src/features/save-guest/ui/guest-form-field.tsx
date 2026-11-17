import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { NativeSelect } from "@/shared/ui/native-select";

import type { FieldConfig } from "../config/guest-fields";

type GuestFormFieldProps = {
  id: string;
  field: FieldConfig;
  defaultValue: string;
  error?: string;
};

export function GuestFormField({ id, field, defaultValue, error }: GuestFormFieldProps) {
  const describedBy =
    [error ? `${id}-error` : null, field.hint ? `${id}-hint` : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="grid content-start gap-2">
      <Label htmlFor={id}>{field.label}</Label>
      {"options" in field ? (
        <NativeSelect
          id={id}
          name={field.name}
          defaultValue={defaultValue}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        >
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelect>
      ) : (
        <Input
          id={id}
          name={field.name}
          defaultValue={defaultValue}
          // Data of the guest, not of the user: browser autofill would offer the wrong values.
          autoComplete="off"
          maxLength={field.maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
      )}
      {field.hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {field.hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
