"use client";

import { pageSizeLabel, type TemplatePage } from "@/entities/template";
import { NativeSelect } from "@/shared/ui/native-select";

import { EDITOR_COPY } from "../config/field-presets";

type TemplatePageSwitcherProps = {
  pages: TemplatePage[];
  pageIndex: number;
  onShowPage: (index: number) => void;
};

export function TemplatePageSwitcher({ pages, pageIndex, onShowPage }: TemplatePageSwitcherProps) {
  const page = pages[pageIndex];

  return (
    <div className="flex items-center gap-2">
      {pages.length > 1 && (
        <NativeSelect
          aria-label={EDITOR_COPY.pageSelect}
          value={pageIndex}
          onChange={(event) => onShowPage(Number(event.target.value))}
        >
          {pages.map((_page, index) => (
            <option key={index} value={index}>
              {EDITOR_COPY.page(index)}
            </option>
          ))}
        </NativeSelect>
      )}
      {page && <span className="text-sm text-muted-foreground">{pageSizeLabel(page)}</span>}
    </div>
  );
}
