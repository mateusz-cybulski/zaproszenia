"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import type { GuestId } from "@/entities/guest";

import { checkGuestWithAi } from "../api/check-guest-with-ai";
import { getVerificationQueueAction } from "../api/get-verification-queue-action";

// A few at a time: each check waits seconds for the model, one by one would take long.
const PARALLEL_CHECKS = 3;

export type AiRunCounts = { verified: number; needsReview: number; failed: number };
type AiRunState = "idle" | "loading" | "running" | "stopped" | "done";

const NO_COUNTS: AiRunCounts = { verified: 0, needsReview: 0, failed: 0 };

export function useAiVerificationRun() {
  const router = useRouter();
  const [state, setState] = useState<AiRunState>("idle");
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<AiRunCounts>(NO_COUNTS);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  // Without ids it checks every guest still waiting for a check.
  async function start(ids?: GuestId[]) {
    const controller = new AbortController();
    abort.current = controller;
    // A function, not the property read inline: TypeScript keeps the value of the first check.
    const aborted = () => controller.signal.aborted;
    setError(null);
    setCounts(NO_COUNTS);
    setState("loading");
    const queue = ids ? { guestIds: ids } : await getVerificationQueueAction();
    if (aborted()) {
      return;
    }
    if (queue.error !== undefined) {
      setError(queue.error);
      setState("idle");
      return;
    }
    const pending: GuestId[] = [...queue.guestIds];
    setTotal(pending.length);
    setState("running");

    async function worker() {
      for (let id = pending.shift(); id !== undefined; id = pending.shift()) {
        if (aborted()) {
          return;
        }
        let status;
        try {
          status = await checkGuestWithAi(id, controller.signal);
        } catch {
          // Aborted (or the network gave up): an aborted check is not counted.
          if (aborted()) {
            return;
          }
          status = null;
        }
        setCounts((current) =>
          status === "verified_ai"
            ? { ...current, verified: current.verified + 1 }
            : status === "needs_review"
              ? { ...current, needsReview: current.needsReview + 1 }
              : { ...current, failed: current.failed + 1 },
        );
      }
    }

    await Promise.all(Array.from({ length: PARALLEL_CHECKS }, worker));
    if (!aborted()) {
      setState("done");
      router.refresh();
    }
  }

  // Aborts the checks in flight at once; a check the API had already sent to the model may still
  // be saved there, which the refreshed list then shows.
  function stop() {
    abort.current?.abort();
    setState((current) => (current === "idle" ? current : "stopped"));
    router.refresh();
  }

  function reset() {
    if (state !== "idle") {
      stop();
    }
    setState("idle");
    setError(null);
  }

  const done = counts.verified + counts.needsReview + counts.failed;
  return { state, total, done, counts, error, start, stop, reset };
}
