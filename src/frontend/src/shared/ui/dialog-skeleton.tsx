"use client";

import { useRouter } from "next/navigation";

import { cn } from "@/shared/lib/css";
import { Dialog, DialogBody, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { Skeleton } from "@/shared/ui/skeleton";

type DialogSkeletonProps = {
  // "title-bar": a dialog with the edited name in the middle; "header": a title and a description.
  header: "title-bar" | "header";
  className?: string;
};

// A dialog route that is still loading: the dialog opens at once, at its final width, and
// closing it goes back to where it was opened from.
export function DialogSkeleton({ header, className }: DialogSkeletonProps) {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className={className} aria-describedby={undefined}>
        <DialogTitle className="sr-only">Ładowanie…</DialogTitle>
        <div
          className={cn(
            "flex shrink-0 items-center gap-3 border-b px-6 pr-14",
            header === "title-bar" ? "justify-center py-4" : "py-6",
          )}
        >
          {header === "title-bar" ? (
            <Skeleton className="h-8 w-72" />
          ) : (
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}
        </div>
        <DialogBody role="status" aria-label="Ładowanie">
          {Array.from({ length: 4 }, (_line, index) => (
            <div key={index} className="grid gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
