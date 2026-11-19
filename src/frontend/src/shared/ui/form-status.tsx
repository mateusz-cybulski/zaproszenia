import type { SubmissionResult } from "@conform-to/react";

const FIX_FIELDS = "Popraw zaznaczone pola.";

type FormStatusProps = { result: SubmissionResult | undefined; successMessage?: string };

// Announces the outcome of the last submit: a form-level error, a hint to fix fields, or success.
export function FormStatus({ result, successMessage }: FormStatusProps) {
  const formError = result?.error?.[""]?.[0];
  const hasFieldErrors = Object.entries(result?.error ?? {}).some(
    ([name, errors]) => name !== "" && errors && errors.length > 0,
  );
  const failure = formError ?? (hasFieldErrors ? FIX_FIELDS : null);

  return (
    <p role="status" className="text-sm text-muted-foreground">
      {failure ? (
        <span className="text-destructive">{failure}</span>
      ) : (
        result?.status === "success" && successMessage
      )}
    </p>
  );
}
