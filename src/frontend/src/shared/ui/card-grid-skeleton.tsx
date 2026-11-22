import { Skeleton } from "@/shared/ui/skeleton";

// Cards that are still loading, in the grid and size of the cards they become.
export function CardGridSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div
      role="status"
      aria-label="Ładowanie"
      className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-4"
    >
      {Array.from({ length: cards }, (_card, index) => (
        <div key={index} className="grid overflow-hidden rounded-xl ring-1 ring-foreground/10">
          <Skeleton className="h-48 rounded-none" />
          <div className="grid gap-2 p-4">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex gap-2 border-t p-4">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-7 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
