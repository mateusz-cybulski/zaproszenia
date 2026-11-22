import { Skeleton } from "@/shared/ui/skeleton";

type TableSkeletonProps = { columns: number; rows?: number };

// A list that is still loading, in the shape of the table it becomes.
export function TableSkeleton({ columns, rows = 6 }: TableSkeletonProps) {
  const cells = Array.from({ length: columns }, (_cell, index) => index);

  return (
    <div role="status" aria-label="Ładowanie listy" className="rounded-lg border">
      <div className="flex gap-6 border-b px-3 py-3">
        {cells.map((cell) => (
          <Skeleton key={cell} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_row, row) => (
        <div key={row} className="flex items-center gap-6 border-b px-3 py-4 last:border-b-0">
          {cells.map((cell) => (
            <Skeleton key={cell} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
