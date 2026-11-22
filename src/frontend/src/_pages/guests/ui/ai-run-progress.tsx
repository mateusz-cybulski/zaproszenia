"use client";

import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { Spinner } from "@/shared/ui/spinner";

import { AI_RUN_COPY as COPY } from "../config/ai-run-copy";
import type { useAiVerificationRun } from "../model/use-ai-verification-run";

type AiRunProgressProps = {
  run: ReturnType<typeof useAiVerificationRun>;
  onClose: () => void;
};

export function AiRunProgress({ run, onClose }: AiRunProgressProps) {
  const { state, total, done, counts } = run;
  const running = state === "loading" || state === "running";
  const finished = state === "done" || state === "stopped";

  if (finished && total === 0) {
    return (
      <div className="grid gap-4">
        <p className="text-sm">{COPY.nothingToCheck}</p>
        <div className="flex justify-end">
          <Button onClick={onClose}>{COPY.close}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium" aria-live="polite">
          {running && <Spinner decorative />}
          {COPY.progress(done, total)}
          {state === "done" && ` · ${COPY.done}`}
          {state === "stopped" && ` · ${COPY.stopped}`}
        </p>
        <Progress value={total === 0 ? 0 : (done / total) * 100} aria-label={COPY.progressLabel} />
      </div>
      <dl className="grid grid-cols-3 gap-3 text-sm">
        <Count label={COPY.verified} value={counts.verified} />
        <Count label={COPY.needsReview} value={counts.needsReview} />
        <Count label={COPY.failed} value={counts.failed} />
      </dl>
      <div className="flex justify-end">
        {running ? (
          <Button variant="outline" onClick={run.stop}>
            {COPY.stop}
          </Button>
        ) : (
          <Button onClick={onClose}>{COPY.close}</Button>
        )}
      </div>
    </div>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid gap-0.5 rounded-lg border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
