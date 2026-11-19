import type { SubmissionResult } from "@conform-to/react";

// A Server Action behind a Conform form: it replies with submission.reply(...).
export type FormAction = (
  previous: SubmissionResult | undefined,
  formData: FormData,
) => Promise<SubmissionResult>;
