import { Page } from "@/shared/ui/page";
import { Skeleton } from "@/shared/ui/skeleton";

// Shown by Next while the settings load (loading.tsx); the e-mail under the title comes later.
export function SettingsLoading() {
  return (
    <Page title="Ustawienia">
      <div role="status" aria-label="Ładowanie" className="grid max-w-2xl gap-4">
        {Array.from({ length: 4 }, (_field, index) => (
          <div key={index} className="grid gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </Page>
  );
}
