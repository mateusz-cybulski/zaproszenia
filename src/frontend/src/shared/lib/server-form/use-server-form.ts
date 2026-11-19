"use client";

import { type DefaultValue, getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { type FormEvent, startTransition, useActionState, useEffect, useEffectEvent } from "react";
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
  const [form, fields] = useForm<z.input<Schema>, z.output<Schema>>({
    lastResult,
    defaultValue,
    shouldValidate: "onSubmit",
    shouldRevalidate: "onInput",
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  });
  // Only a plain submission.reply() carries status "success"; reply({ resetForm }) does not.
  const succeed = useEffectEvent(() => onSuccess?.());

  useEffect(() => {
    if (lastResult?.status === "success") {
      succeed();
    }
  }, [lastResult]);

  const conformProps = getFormProps(form);

  // React 19 resets a form after its `action` runs, back to the values it rendered with, so a form
  // that stays on screen would lose what was just saved. Submitting from onSubmit avoids that reset;
  // `action` remains for a browser without JavaScript.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    conformProps.onSubmit(event);
    if (event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    const submitter = event.nativeEvent instanceof SubmitEvent ? event.nativeEvent.submitter : null;
    const formData = new FormData(event.currentTarget, submitter);
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
