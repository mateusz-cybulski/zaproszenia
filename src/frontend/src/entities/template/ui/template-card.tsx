import type { ReactNode } from "react";

import { routes } from "@/shared/routes";
import { Badge } from "@/shared/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";

import { TEMPLATE_KIND_LABELS } from "../config/template-kind";
import { pageSizeLabel } from "../lib/page-size";
import type { Template } from "../model/template";

type TemplateCardProps = { template: Template; actions?: ReactNode };

export function TemplateCard({ template, actions }: TemplateCardProps) {
  const [firstPage] = template.pages;
  const details = [
    firstPage && pageSizeLabel(firstPage),
    template.pages.length > 1 && `${template.pages.length} strony`,
    `pól: ${template.fieldCount}`,
  ].filter(Boolean);

  return (
    <Card className="pt-0">
      <div className="flex h-48 items-center justify-center border-b bg-muted p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={routes.savedTemplatePreviewImage(template.id, template.updatedAt)}
          alt=""
          loading="lazy"
          className="max-h-full max-w-full bg-white shadow-sm"
        />
      </div>
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-2">
          <span className="min-w-0 break-words">{template.name}</span>
          <Badge variant="outline">{TEMPLATE_KIND_LABELS[template.kind]}</Badge>
        </CardTitle>
        <CardDescription>{details.join(" · ")}</CardDescription>
      </CardHeader>
      {actions && <CardFooter className="flex flex-wrap gap-2 border-t">{actions}</CardFooter>}
    </Card>
  );
}
