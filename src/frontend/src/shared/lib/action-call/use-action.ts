"use client";

import { useState, useTransition } from "react";

import type { ActionResult } from "@/shared/lib/actions";

type UseActionOptions = { onSuccess?: () => void };

export function useAction<Args extends unknown[]>(
  action: (...args: Args) => Promise<ActionResult>,
  { onSuccess }: UseActionOptions = {},
) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(...args: Args) {
    setError(null);
    startTransition(async () => {
      const result = await action(...args);
      if (result.error) {
        setError(result.error);
      } else {
        onSuccess?.();
      }
    });
  }

  return { run, pending, error, setError };
}
