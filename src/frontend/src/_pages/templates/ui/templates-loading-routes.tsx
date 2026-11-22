import { CardGridSkeleton } from "@/shared/ui/card-grid-skeleton";
import { DialogSkeleton } from "@/shared/ui/dialog-skeleton";
import { Page } from "@/shared/ui/page";

import { TEMPLATES_PAGE } from "../config/page-copy";

// Shown by Next while the route's server components load (loading.tsx).
export function TemplatesLoading() {
  return (
    <Page title={TEMPLATES_PAGE.title} description={TEMPLATES_PAGE.description}>
      <CardGridSkeleton />
    </Page>
  );
}

export function TemplateEditModalLoading() {
  return <DialogSkeleton header="title-bar" className="max-w-6xl" />;
}
