"use client";

import { useInputControl } from "@conform-to/react";

import { DateTimePicker } from "@/shared/ui/date-time-picker";

type DateTimeInputProps = {
  meta: { key?: string; name: string; formId: string; initialValue?: string };
  id: string;
  invalid?: boolean;
  describedBy?: string;
};

// The picker as a form field: Conform keeps its value in a hidden input of the form, so it is
// submitted, validated and counted as a change like a typed one.
export function DateTimeInput({ meta, id, invalid, describedBy }: DateTimeInputProps) {
  const control = useInputControl(meta);

  return (
    <DateTimePicker
      id={id}
      value={typeof control.value === "string" ? control.value : ""}
      onChange={control.change}
      onBlur={control.blur}
      invalid={invalid}
      describedBy={describedBy}
    />
  );
}
