import { FileText } from "lucide-react";
import type { Metadata } from "next";

import { getTemplates } from "@/entities/template/index.server";
import { requireViewer } from "@/entities/viewer/index.server";
import { Page } from "@/shared/ui/page";

import { TemplateGrid } from "./template-grid";
import { UploadTemplateDialog } from "./upload-template-dialog";

export const metadata: Metadata = { title: "Szablony · Zaproszenia" };

export async function TemplatesPage() {
  // The layout's session check does not run on link navigation.
  await requireViewer();
  const templates = await getTemplates();
  const own = templates.filter((template) => !template.isSystem);
  const system = templates.filter((template) => template.isSystem);

  return (
    <Page
      title="Szablony"
      description="Projekty zaproszeń i kopert w PDF z polami na dane gości."
      actions={<UploadTemplateDialog />}
    >
      <section aria-labelledby="own-templates" className="grid gap-3">
        <h2 id="own-templates" className="font-medium">
          Moje szablony
        </h2>
        {own.length > 0 ? (
          <TemplateGrid templates={own} />
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="size-4" aria-hidden /> Wgraj PDF od grafika albo skopiuj szablon
            systemowy.
          </p>
        )}
      </section>
      <section aria-labelledby="system-templates" className="grid gap-3">
        <div className="grid gap-1">
          <h2 id="system-templates" className="font-medium">
            Szablony systemowe
          </h2>
          <p className="text-sm text-muted-foreground">
            Puste strony z gotowym układem pól: do testów i do druku na własnym papierze.
          </p>
        </div>
        <TemplateGrid templates={system} />
      </section>
    </Page>
  );
}
