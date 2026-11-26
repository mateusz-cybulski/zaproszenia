"use client";

import { type DefaultValue, getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import {
  type SubmitEvent,
  startTransition,
  useActionState,
  useEffect,
  useEffectEvent,
} from "react";
import type { z } from "zod";

import type { FormAction } from "@/shared/lib/forms";

type UseServerFormOptions<
  Schema extends z.ZodType<Record<string, unknown>, Record<string, unknown>>,
> = {
  schema: Schema;
  action: FormAction;
  defaultValue?: DefaultValue<z.input<Schema>>;
  onSuccess?: () => void;
};

// The same schema checks the form in the browser, then again in the action. Not on blur: leaving a
// field for the dialog's close button would show errors, grow the dialog and move the button away.
export function useServerForm<
  Schema extends z.ZodType<Record<string, unknown>, Record<string, unknown>>,
>({ schema, action, defaultValue, onSuccess }: UseServerFormOptions<Schema>) {
  const [lastResult, formAction, pending] = useActionState(action, undefined);
  // After a save the saved values are the new starting point: otherwise Conform keeps comparing
  // with the values the form opened with, and a form that stays open looks unsaved (form.dirty).
  const savedValue =
    lastResult?.status === "success" && lastResult.initialValue
      ? (lastResult.initialValue as DefaultValue<z.input<Schema>>)
      : undefined;
  const [form, fields] = useForm<z.input<Schema>, z.output<Schema>>({
    lastResult,
    defaultValue: savedValue ?? defaultValue,
    shouldValidate: "onSubmit",
    shouldRevalidate: "onInput",
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  });
  // Only a plain submission.reply() carries status "success"; reply({ resetForm }) does not.
  const succeed = useEffectEvent(() => {
    form.reset();
    onSuccess?.();
  });

  useEffect(() => {
    if (lastResult?.status === "success") {
      succeed();
    }
  }, [lastResult]);

  const conformProps = getFormProps(form);

  // React 19 resets a form after its `action` runs, back to the values it rendered with, so a form
  // that stays on screen would lose what was just saved. Submitting from onSubmit avoids that reset;
  // `action` remains for a browser without JavaScript.
  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    conformProps.onSubmit(event);
    if (event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    const formData = new FormData(event.currentTarget, event.nativeEvent.submitter);
    startTransition(() => formAction(formData));
  }

  return {
    form,
    fields,
    formProps: { ...conformProps, action: formAction, onSubmit },
    pending,
    lastResult,
  };
}
