import { DateTimeInput } from "@/shared/ui/date-time-input";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { NativeSelect } from "@/shared/ui/native-select";
import { Textarea } from "@/shared/ui/textarea";

export type FormFieldConfig<Name extends string = string> = {
  name: Name;
  label: string;
  required?: true;
  hint?: string;
  // Default "off": most forms here hold other people's data, where autofill offers the user's own.
  autoComplete?: string;
} & (
  | { maxLength: number; multiline?: false }
  | { maxLength: number; multiline: true; rows: number }
  | { inputType: "datetime-local" }
  | { options: readonly { value: string; label: string }[] }
);

// The part of Conform's field metadata a plain input needs.
export type FormFieldMeta = {
  id: string;
  name: string;
  formId: string;
  key: string | undefined;
  defaultValue: string | undefined;
  errors: string[] | undefined;
  errorId: string;
  descriptionId: string;
};

type FormFieldProps = { field: FormFieldConfig; meta: FormFieldMeta };

export function FormField({ field, meta }: FormFieldProps) {
  const error = meta.errors?.[0];
  const describedBy =
    [error ? meta.errorId : null, field.hint ? meta.descriptionId : null]
      .filter(Boolean)
      .join(" ") || undefined;
  const inputProps = {
    id: meta.id,
    name: meta.name,
    defaultValue: meta.defaultValue ?? "",
    required: field.required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  };

  return (
    <div className="grid content-start gap-2">
      <Label htmlFor={meta.id} required={field.required}>
        {field.label}
      </Label>
      {"inputType" in field ? (
        <DateTimeInput
          key={meta.key}
          meta={{
            key: meta.key,
            name: meta.name,
            formId: meta.formId,
            initialValue: meta.defaultValue,
          }}
          id={meta.id}
          invalid={Boolean(error)}
          describedBy={describedBy}
        />
      ) : "options" in field ? (
        <NativeSelect key={meta.key} {...inputProps}>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelect>
      ) : "multiline" in field && field.multiline ? (
        <Textarea
          key={meta.key}
          {...inputProps}
          rows={field.rows}
          autoComplete={field.autoComplete ?? "off"}
          maxLength={field.maxLength}
        />
      ) : (
        <Input
          key={meta.key}
          {...inputProps}
          type="text"
          autoComplete={field.autoComplete ?? "off"}
          maxLength={"maxLength" in field ? field.maxLength : undefined}
        />
      )}
      {field.hint && (
        <p id={meta.descriptionId} className="text-xs text-muted-foreground">
          {field.hint}
        </p>
      )}
      {error && (
        <p id={meta.errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
